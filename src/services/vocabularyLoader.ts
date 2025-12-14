/**
 * Vocabulary Loader Service
 * Сервис для загрузки модулей словаря из JSON файлов
 * 
 * Особенности:
 * - Автоматическая загрузка коллекций для модуля A1
 * - Retry с exponential backoff для устойчивости к сетевым проблемам
 * - Кэширование загруженных модулей
 * - Валидация структуры данных
 */

import type { ModuleId } from '@/app/constants';
import { AVAILABLE_MODULES } from '@/app/constants';
import type { VocabularyModule, Collection, Word } from '@/shared/types';
import { retryWithBackoff, retryPresets } from '@/shared/utils/retry';
import { log } from '@/shared/utils';

// Статический импорт корневого модуля A1 для Vite
// Коллекции этого модуля подхватываем автоматически через import.meta.glob
import A1Module from '@/data/modules/A1/index.json';

/**
 * Автоматическая загрузка всех JSON-коллекций A1.
 * Vite импортирует все файлы из папки collections, дальше мы находим нужную коллекцию по её id.
 * Single Source of Truth: id живёт внутри JSON-файла и в index.json, без отдельного маппинга в коде.
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - import.meta.glob типизируется Vite, TS этого по умолчанию не знает
const A1_COLLECTIONS_FILES = import.meta.glob('@/data/modules/A1/collections/*.json', {
  eager: true,
});

/**
 * Кэш загруженных модулей (в памяти)
 * Предотвращает повторную загрузку и парсинг одних и тех же данных
 */
const modulesCache = new Map<ModuleId, VocabularyModule>();

/**
 * Маппинг модулей для быстрого доступа
 */
const MODULES_MAP: Record<ModuleId, () => Promise<VocabularyModule>> = {
  A1: async () => A1Module as unknown as VocabularyModule,
  // TODO: Добавить остальные модули когда они будут созданы
  A2: async () => {
    throw new VocabularyLoadError('Модуль A2 еще не создан', 'A2');
  },
  B1: async () => {
    throw new VocabularyLoadError('Модуль B1 еще не создан', 'B1');
  },
  B2: async () => {
    throw new VocabularyLoadError('Модуль B2 еще не создан', 'B2');
  },
  C1: async () => {
    throw new VocabularyLoadError('Модуль C1 еще не создан', 'C1');
  },
  C2: async () => {
    throw new VocabularyLoadError('Модуль C2 еще не создан', 'C2');
  },
};

/**
 * Ошибка загрузки модуля
 */
export class VocabularyLoadError extends Error {
  constructor(message: string, public readonly moduleId: ModuleId) {
    super(message);
    this.name = 'VocabularyLoadError';
  }
}

/**
 * Валидация структуры модуля
 */
function validateModule(data: unknown): data is VocabularyModule {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const module = data as Record<string, unknown>;

  // Проверка обязательных полей
  if (typeof module.moduleId !== 'string') {
    return false;
  }

  if (!AVAILABLE_MODULES.includes(module.moduleId as ModuleId)) {
    return false;
  }

  if (typeof module.name !== 'string' || module.name.length === 0) {
    return false;
  }

  if (!Array.isArray(module.collections)) {
    return false;
  }

  if (module.collections.length === 0) {
    return false;
  }

  // Валидация метаданных подборок
  for (const collection of module.collections) {
    if (!validateCollectionMetadata(collection)) {
      return false;
    }
  }

  return true;
}

/**
 * Валидация структуры подборки (метаданные из index.json)
 */
function validateCollectionMetadata(collection: unknown): collection is Omit<Collection, 'categories'> & { file?: string } {
  if (!collection || typeof collection !== 'object') {
    return false;
  }

  const coll = collection as Record<string, unknown>;

  if (typeof coll.id !== 'string' || coll.id.length === 0) {
    return false;
  }

  if (typeof coll.name !== 'string' || coll.name.length === 0) {
    return false;
  }

  // Подборка должна иметь либо file, либо categories
  if (coll.file !== undefined && typeof coll.file !== 'string') {
    return false;
  }

  if (coll.categories !== undefined && (typeof coll.categories !== 'object' || coll.categories === null)) {
    return false;
  }

  return true;
}

/**
 * Валидация структуры подборки (полная, с категориями)
 */
function validateCollection(collection: unknown): collection is Collection {
  if (!collection || typeof collection !== 'object') {
    return false;
  }

  const coll = collection as Record<string, unknown>;

  if (typeof coll.id !== 'string' || coll.id.length === 0) {
    return false;
  }

  if (typeof coll.name !== 'string' || coll.name.length === 0) {
    return false;
  }

  // Если есть file, то categories не обязательны (будут загружены отдельно)
  if (coll.file) {
    return true;
  }

  // Если нет file, то categories обязательны
  if (!coll.categories || typeof coll.categories !== 'object') {
    return false;
  }

  const categories = coll.categories as Record<string, unknown>;

  // Проверка категорий - все поддерживаемые части речи
  const validCategories = [
    'phrases',
    'verbs',
    'nouns',
    'adjectives',
    'adverbs',
    'pronouns',
    'prepositions',
    'conjunctions',
    'interjections',
    'articles',
    'numerals',
    'determiners',
  ];

  for (const [categoryKey, words] of Object.entries(categories)) {
    if (!validCategories.includes(categoryKey)) {
      return false;
    }

    if (!Array.isArray(words)) {
      return false;
    }

    // Валидация слов
    for (const word of words) {
      if (!validateWord(word)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Валидация структуры слова
 */
function validateWord(word: unknown): word is Word {
  if (!word || typeof word !== 'object') {
    return false;
  }

  const w = word as Record<string, unknown>;

  // Обязательные поля
  if (typeof w.id !== 'string' || w.id.length === 0) {
    return false;
  }

  if (typeof w.english !== 'string' || w.english.length === 0) {
    return false;
  }

  if (typeof w.translation !== 'string' || w.translation.length === 0) {
    return false;
  }

  if (typeof w.category !== 'string') {
    return false;
  }

  // Проверка валидности категории слова
  const validWordCategories = [
    'phrases',
    'verbs',
    'nouns',
    'adjectives',
    'adverbs',
    'pronouns',
    'prepositions',
    'conjunctions',
    'interjections',
    'articles',
    'numerals',
    'determiners',
  ];

  if (!validWordCategories.includes(w.category)) {
    return false;
  }

  // Опциональные поля (проверяем типы, если они есть)
  if (w.definition !== undefined && typeof w.definition !== 'string') {
    return false;
  }

  if (w.example !== undefined && typeof w.example !== 'string') {
    return false;
  }

  if (w.subcategory !== undefined && typeof w.subcategory !== 'string') {
    return false;
  }

  if (w.tags !== undefined) {
    if (!Array.isArray(w.tags)) {
      return false;
    }
    for (const tag of w.tags) {
      if (typeof tag !== 'string') {
        return false;
      }
    }
  }

  return true;
}

/**
 * Находит данные коллекции A1 по её id среди всех JSON-файлов в папке collections.
 */
function findA1CollectionDataById(collectionId: string): Collection | null {
  for (const mod of Object.values(A1_COLLECTIONS_FILES)) {
    // Для JSON Vite кладёт данные в default-экспорт
    const data = (mod as any).default ?? mod;
    if (data && typeof data === 'object' && (data as any).id === collectionId) {
      return data as Collection;
    }
  }
  return null;
}

/**
 * Загружает коллекции из файлов для модуля A1.
 * Больше не требует ручного маппинга коллекций в коде — всё берётся из файлов.
 */
async function loadA1Collections(moduleMeta: { collections: Array<{ id: string; file?: string }> }): Promise<Collection[]> {
  const loadedCollections: Collection[] = [];

  for (const collectionMeta of moduleMeta.collections) {
    let collection: Collection;

    if (collectionMeta.file) {
      // Загружаем коллекцию из соответствующего JSON-файла
      const collectionId = collectionMeta.id;
      const collectionData = findA1CollectionDataById(collectionId);

      if (!collectionData) {
        throw new VocabularyLoadError(
          `Коллекция "${collectionId}" не найдена среди файлов A1/collections`,
          'A1'
        );
      }

      // Валидируем загруженную коллекцию
      if (!validateCollection(collectionData)) {
        throw new VocabularyLoadError(
          `Коллекция "${collectionId}" имеет невалидную структуру`,
          'A1'
        );
      }

      // Объединяем метаданные с данными коллекции
      collection = {
        ...collectionMeta,
        ...collectionData,
        categories: collectionData.categories || {},
      };
    } else {
      // Коллекция встроена в index.json (для обратной совместимости)
      collection = collectionMeta as Collection;
      
      if (!validateCollection(collection)) {
        throw new VocabularyLoadError(
          `Коллекция "${collectionMeta.id}" имеет невалидную структуру`,
          'A1'
        );
      }
    }

    loadedCollections.push(collection);
  }

  return loadedCollections;
}

/**
 * Проверка уникальности ID слов в модуле
 */
function validateWordIdsUniqueness(module: VocabularyModule): void {
  const wordIds = new Set<string>();
  const duplicates: string[] = [];

  for (const collection of module.collections) {
    if (!collection.categories) continue;

    for (const words of Object.values(collection.categories)) {
      for (const word of words) {
        if (wordIds.has(word.id)) {
          duplicates.push(word.id);
        } else {
          wordIds.add(word.id);
        }
      }
    }
  }

  if (duplicates.length > 0) {
    throw new VocabularyLoadError(
      `Обнаружены дубликаты ID слов в модуле "${module.moduleId}": ${duplicates.join(', ')}`,
      module.moduleId
    );
  }
}

/**
 * Валидация и возврат данных модуля
 */
async function validateAndReturnData(data: unknown, moduleId: ModuleId): Promise<VocabularyModule> {
  // Валидация структуры данных
  if (!validateModule(data)) {
    throw new VocabularyLoadError(
      `Модуль "${moduleId}" имеет невалидную структуру данных`,
      moduleId
    );
  }

  // Проверка соответствия moduleId
  if (data.moduleId !== moduleId) {
    throw new VocabularyLoadError(
      `Несоответствие moduleId: ожидался "${moduleId}", получен "${data.moduleId}"`,
      moduleId
    );
  }

  // Загружаем коллекции из файлов, если нужно
  let finalModule: VocabularyModule;
  if (moduleId === 'A1') {
    const collections = await loadA1Collections(data);
    finalModule = {
      ...data,
      collections,
    };
  } else {
    finalModule = data;
  }

  // Проверка уникальности ID слов
  validateWordIdsUniqueness(finalModule);

  return finalModule;
}

/**
 * Загружает модуль словаря по его ID
 * @param moduleId - ID модуля (A1, A2, B1, etc.)
 * @param options - Опции загрузки
 * @param options.forceReload - Принудительная перезагрузка (игнорировать кэш)
 * @param options.useRetry - Использовать retry логику (по умолчанию true)
 * @returns Promise с данными модуля
 * @throws VocabularyLoadError если модуль не найден или невалиден
 */
export async function loadModule(
  moduleId: ModuleId,
  options: { forceReload?: boolean; useRetry?: boolean } = {}
): Promise<VocabularyModule> {
  const { forceReload = false, useRetry = true } = options;

  // Проверка, что moduleId валиден
  if (!AVAILABLE_MODULES.includes(moduleId)) {
    throw new VocabularyLoadError(
      `Модуль "${moduleId}" не существует. Доступные модули: ${AVAILABLE_MODULES.join(', ')}`,
      moduleId
    );
  }

  // Проверяем кэш (если не форсируем перезагрузку)
  if (!forceReload && modulesCache.has(moduleId)) {
    log.debug('VocabularyLoader', `Модуль ${moduleId} взят из кэша`);
    return modulesCache.get(moduleId)!;
  }

  log.info('VocabularyLoader', `Начинаем загрузку модуля ${moduleId}`, {
    forceReload,
    useRetry,
  });

  try {
    // Получаем функцию загрузки модуля из маппинга
    const loadModuleFn = MODULES_MAP[moduleId];
    
    if (!loadModuleFn) {
      throw new VocabularyLoadError(
        `Модуль "${moduleId}" не найден в маппинге модулей`,
        moduleId
      );
    }

    // Функция загрузки и валидации
    const loadAndValidate = async (): Promise<VocabularyModule> => {
      log.debug('VocabularyLoader', `Загружаем данные модуля ${moduleId}`);
      
      // Загружаем модуль
      const data = await loadModuleFn();

      log.debug('VocabularyLoader', `Валидируем модуль ${moduleId}`);
      
      // Валидация и возврат данных
      return await validateAndReturnData(data, moduleId);
    };

    // Загружаем с retry или без
    let module: VocabularyModule;
    if (useRetry) {
      log.debug('VocabularyLoader', `Используем retry логику для модуля ${moduleId}`);
      
      module = await retryWithBackoff(loadAndValidate, {
        ...retryPresets.standard,
        shouldRetry: (error) => {
          // Не повторяем для VocabularyLoadError (это логические ошибки, не сетевые)
          if (error instanceof VocabularyLoadError) {
            log.warn('VocabularyLoader', 'VocabularyLoadError не подлежит retry', error);
            return false;
          }
          return true;
        },
        onRetry: (attempt, error) => {
          log.warn(
            'VocabularyLoader',
            `Попытка ${attempt} загрузки модуля ${moduleId} не удалась`,
            error
          );
        },
      });
    } else {
      module = await loadAndValidate();
    }

    // Кэшируем успешно загруженный модуль
    modulesCache.set(moduleId, module);
    
    log.info('VocabularyLoader', `Модуль ${moduleId} успешно загружен`, {
      collectionsCount: module.collections.length,
      cached: true,
    });

    return module;
  } catch (error) {
    // Обработка различных типов ошибок
    if (error instanceof VocabularyLoadError) {
      log.error('VocabularyLoader', `VocabularyLoadError для модуля ${moduleId}`, error);
      throw error;
    }

    // Ошибка загрузки файла
    if (error instanceof Error) {
      // Ошибка парсинга JSON
      if (error.message.includes('JSON') || error.message.includes('parse')) {
        const vocabError = new VocabularyLoadError(
          `Ошибка парсинга JSON модуля "${moduleId}": ${error.message}`,
          moduleId
        );
        log.error('VocabularyLoader', 'Ошибка парсинга JSON', vocabError);
        throw vocabError;
      }

      // Другие ошибки
      const vocabError = new VocabularyLoadError(
        `Ошибка загрузки модуля "${moduleId}": ${error.message}`,
        moduleId
      );
      log.error('VocabularyLoader', 'Ошибка загрузки', vocabError);
      throw vocabError;
    }

    // Неизвестная ошибка
    const vocabError = new VocabularyLoadError(
      `Неизвестная ошибка при загрузке модуля "${moduleId}"`,
      moduleId
    );
    log.error('VocabularyLoader', 'Неизвестная ошибка', vocabError);
    throw vocabError;
  }
}

/**
 * Очистить кэш загруженных модулей
 * @param moduleId - ID модуля для очистки (если не указан, очищается весь кэш)
 */
export function clearModuleCache(moduleId?: ModuleId): void {
  if (moduleId) {
    modulesCache.delete(moduleId);
    log.debug('VocabularyLoader', `Кэш модуля ${moduleId} очищен`);
  } else {
    modulesCache.clear();
    log.debug('VocabularyLoader', 'Весь кэш модулей очищен');
  }
}

/**
 * Проверяет, существует ли модуль
 * @param moduleId - ID модуля для проверки
 * @returns Promise<boolean> - true если модуль существует и валиден
 */
export async function moduleExists(moduleId: ModuleId): Promise<boolean> {
  try {
    await loadModule(moduleId);
    return true;
  } catch {
    return false;
  }
}

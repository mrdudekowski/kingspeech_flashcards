/**
 * Vocabulary Loader Service
 * Сервис для загрузки модулей словаря из JSON файлов
 */

import type { ModuleId } from '@/app/constants';
import { AVAILABLE_MODULES } from '@/app/constants';
import type { VocabularyModule, Collection, Word } from '@/shared/types';

// Статический импорт всех модулей для Vite
// Vite требует статические пути для импортов
import A1Module from '@/data/modules/A1/index.json';

// Статический импорт всех коллекций A1
import A1BasicVerbs from '@/data/modules/A1/collections/basic-verbs.json';
import A1DailyLife from '@/data/modules/A1/collections/daily-life.json';
import A1IrregularVerbs from '@/data/modules/A1/collections/irregular-verbs.json';
import A1ModalVerbs from '@/data/modules/A1/collections/modal-verbs.json';
import A1PhrasalVerbs from '@/data/modules/A1/collections/phrasal-verbs.json';
import A1Expressions from '@/data/modules/A1/collections/expressions.json';
import A1Collocations from '@/data/modules/A1/collections/collocations.json';
import A1CommonPhrases from '@/data/modules/A1/collections/common-phrases.json';
import A1FormalPhrases from '@/data/modules/A1/collections/formal-phrases.json';
import A1InformalPhrases from '@/data/modules/A1/collections/informal-phrases.json';
import A1ClothesAccessories from '@/data/modules/A1/collections/clothes-accessories.json';

/**
 * Маппинг коллекций A1 по их ID
 */
const A1_COLLECTIONS_MAP: Record<string, Collection> = {
  'basic-verbs': A1BasicVerbs as unknown as Collection,
  'daily-life': A1DailyLife as unknown as Collection,
  'irregular-verbs': A1IrregularVerbs as unknown as Collection,
  'modal-verbs': A1ModalVerbs as unknown as Collection,
  'phrasal-verbs': A1PhrasalVerbs as unknown as Collection,
  'expressions': A1Expressions as unknown as Collection,
  'collocations': A1Collocations as unknown as Collection,
  'common-phrases': A1CommonPhrases as unknown as Collection,
  'formal-phrases': A1FormalPhrases as unknown as Collection,
  'informal-phrases': A1InformalPhrases as unknown as Collection,
  'clothes-accessories': A1ClothesAccessories as unknown as Collection,
};

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

  // Проверка категорий (phrases, verbs, nouns, adjectives)
  for (const [categoryKey, words] of Object.entries(categories)) {
    if (!['phrases', 'verbs', 'nouns', 'adjectives'].includes(categoryKey)) {
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

  if (!['phrases', 'verbs', 'nouns', 'adjectives'].includes(w.category)) {
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
 * Загружает коллекции из файлов для модуля A1
 */
async function loadA1Collections(moduleMeta: { collections: Array<{ id: string; file?: string }> }): Promise<Collection[]> {
  const loadedCollections: Collection[] = [];

  for (const collectionMeta of moduleMeta.collections) {
    let collection: Collection;

    if (collectionMeta.file) {
      // Загружаем коллекцию из файла
      const collectionId = collectionMeta.id;
      const collectionData = A1_COLLECTIONS_MAP[collectionId];

      if (!collectionData) {
        throw new VocabularyLoadError(
          `Коллекция "${collectionId}" не найдена в маппинге`,
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
 * @returns Promise с данными модуля
 * @throws VocabularyLoadError если модуль не найден или невалиден
 */
export async function loadModule(moduleId: ModuleId): Promise<VocabularyModule> {
  // Проверка, что moduleId валиден
  if (!AVAILABLE_MODULES.includes(moduleId)) {
    throw new VocabularyLoadError(
      `Модуль "${moduleId}" не существует. Доступные модули: ${AVAILABLE_MODULES.join(', ')}`,
      moduleId
    );
  }

  try {
    // Получаем функцию загрузки модуля из маппинга
    const loadModuleFn = MODULES_MAP[moduleId];
    
    if (!loadModuleFn) {
      throw new VocabularyLoadError(
        `Модуль "${moduleId}" не найден в маппинге модулей`,
        moduleId
      );
    }

    // Загружаем модуль
    const data = await loadModuleFn();

    // Валидация и возврат данных (теперь асинхронная, т.к. может загружать коллекции)
    return await validateAndReturnData(data, moduleId);
  } catch (error) {
    // Обработка различных типов ошибок
    if (error instanceof VocabularyLoadError) {
      throw error;
    }

    // Ошибка загрузки файла
    if (error instanceof Error) {
      // Ошибка парсинга JSON
      if (error.message.includes('JSON') || error.message.includes('parse')) {
        throw new VocabularyLoadError(
          `Ошибка парсинга JSON модуля "${moduleId}": ${error.message}`,
          moduleId
        );
      }

      // Другие ошибки
      throw new VocabularyLoadError(
        `Ошибка загрузки модуля "${moduleId}": ${error.message}`,
        moduleId
      );
    }

    // Неизвестная ошибка
    throw new VocabularyLoadError(
      `Неизвестная ошибка при загрузке модуля "${moduleId}"`,
      moduleId
    );
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

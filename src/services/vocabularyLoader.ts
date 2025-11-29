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

  // Валидация подборок
  for (const collection of module.collections) {
    if (!validateCollection(collection)) {
      return false;
    }
  }

  return true;
}

/**
 * Валидация структуры подборки
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
 * Валидация и возврат данных модуля
 */
function validateAndReturnData(data: unknown, moduleId: ModuleId): VocabularyModule {
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

  return data;
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

    // Валидация и возврат данных
    return validateAndReturnData(data, moduleId);
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

/**
 * Утилита для проверки дубликатов в словаре
 * Проверяет наличие дубликатов по различным критериям
 */

import type { VocabularyModule, Word } from '@/shared/types';

/**
 * Результат проверки дубликатов
 */
export interface DuplicateCheckResult {
  hasDuplicates: boolean;
  duplicateIds: Array<{ id: string; locations: string[] }>;
  duplicateEnglish: Array<{ english: string; locations: string[] }>;
  duplicateEnglishTranslation: Array<{ english: string; translation: string; locations: string[] }>;
  wordsInMultipleCategories: Array<{ word: Word; categories: string[] }>;
  summary: {
    totalWords: number;
    uniqueIds: number;
    uniqueEnglish: number;
    uniqueEnglishTranslation: number;
  };
}

/**
 * Получить все слова из модуля
 */
function getAllWords(module: VocabularyModule): Array<{ word: Word; location: string }> {
  const words: Array<{ word: Word; location: string }> = [];

  module.collections.forEach((collection) => {
    if (collection.categories) {
      Object.entries(collection.categories).forEach(([category, categoryWords]) => {
        categoryWords.forEach((word) => {
          words.push({
            word,
            location: `${module.moduleId}/${collection.id}/${category}`,
          });
        });
      });
    }
  });

  return words;
}

/**
 * Проверить модуль на наличие дубликатов
 */
export function checkDuplicates(module: VocabularyModule): DuplicateCheckResult {
  const allWords = getAllWords(module);
  const result: DuplicateCheckResult = {
    hasDuplicates: false,
    duplicateIds: [],
    duplicateEnglish: [],
    duplicateEnglishTranslation: [],
    wordsInMultipleCategories: [],
    summary: {
      totalWords: allWords.length,
      uniqueIds: 0,
      uniqueEnglish: 0,
      uniqueEnglishTranslation: 0,
    },
  };

  // Проверка дубликатов по ID
  const idMap = new Map<string, string[]>();
  allWords.forEach(({ word, location }) => {
    if (!idMap.has(word.id)) {
      idMap.set(word.id, []);
    }
    idMap.get(word.id)!.push(location);
  });

  idMap.forEach((locations, id) => {
    if (locations.length > 1) {
      result.hasDuplicates = true;
      result.duplicateIds.push({ id, locations });
    }
  });

  result.summary.uniqueIds = idMap.size;

  // Проверка дубликатов по английскому слову
  const englishMap = new Map<string, string[]>();
  allWords.forEach(({ word, location }) => {
    const key = word.english.toLowerCase().trim();
    if (!englishMap.has(key)) {
      englishMap.set(key, []);
    }
    englishMap.get(key)!.push(location);
  });

  englishMap.forEach((locations, english) => {
    if (locations.length > 1) {
      result.duplicateEnglish.push({ english, locations });
    }
  });

  result.summary.uniqueEnglish = englishMap.size;

  // Проверка дубликатов по комбинации english + translation
  const englishTranslationMap = new Map<string, string[]>();
  allWords.forEach(({ word, location }) => {
    const key = `${word.english.toLowerCase().trim()}|${word.translation.toLowerCase().trim()}`;
    if (!englishTranslationMap.has(key)) {
      englishTranslationMap.set(key, []);
    }
    englishTranslationMap.get(key)!.push(location);
  });

  englishTranslationMap.forEach((locations, key) => {
    if (locations.length > 1) {
      const [english, translation] = key.split('|');
      result.hasDuplicates = true;
      result.duplicateEnglishTranslation.push({ english, translation, locations });
    }
  });

  result.summary.uniqueEnglishTranslation = englishTranslationMap.size;

  // Проверка слов, которые встречаются в разных категориях одной коллекции
  const wordInCategoryMap = new Map<string, Map<string, Word>>();
  module.collections.forEach((collection) => {
    if (collection.categories) {
      Object.entries(collection.categories).forEach(([category, categoryWords]) => {
        categoryWords.forEach((word) => {
          const key = `${collection.id}|${word.id}`;
          if (!wordInCategoryMap.has(key)) {
            wordInCategoryMap.set(key, new Map());
          }
          wordInCategoryMap.get(key)!.set(category, word);
        });
      });
    }
  });

  // Проверяем, есть ли слова с одинаковым ID в разных категориях одной коллекции
  const wordsByCollectionAndId = new Map<string, Map<string, Set<string>>>();
  allWords.forEach(({ word, location }) => {
    const [, collectionId, category] = location.split('/');
    const key = `${collectionId}|${word.id}`;
    if (!wordsByCollectionAndId.has(key)) {
      wordsByCollectionAndId.set(key, new Map());
    }
    const categoryMap = wordsByCollectionAndId.get(key)!;
    if (!categoryMap.has(category)) {
      categoryMap.set(category, new Set());
    }
    categoryMap.get(category)!.add(location);
  });

  wordsByCollectionAndId.forEach((categoryMap, key) => {
    if (categoryMap.size > 1) {
      const [, wordId] = key.split('|');
      const word = allWords.find((w) => w.word.id === wordId)?.word;
      if (word) {
        result.wordsInMultipleCategories.push({
          word,
          categories: Array.from(categoryMap.keys()),
        });
      }
    }
  });

  return result;
}

/**
 * Форматировать результат проверки для вывода в консоль
 */
export function formatDuplicateReport(result: DuplicateCheckResult): string {
  const lines: string[] = [];

  lines.push('='.repeat(60));
  lines.push('ОТЧЕТ О ПРОВЕРКЕ ДУБЛИКАТОВ');
  lines.push('='.repeat(60));
  lines.push('');

  // Сводка
  lines.push('📊 СВОДКА:');
  lines.push(`  Всего слов: ${result.summary.totalWords}`);
  lines.push(`  Уникальных ID: ${result.summary.uniqueIds}`);
  lines.push(`  Уникальных английских слов: ${result.summary.uniqueEnglish}`);
  lines.push(`  Уникальных комбинаций (english + translation): ${result.summary.uniqueEnglishTranslation}`);
  lines.push('');

  // Дубликаты по ID (критично!)
  if (result.duplicateIds.length > 0) {
    lines.push('🚨 КРИТИЧЕСКИЕ ДУБЛИКАТЫ ПО ID:');
    result.duplicateIds.forEach(({ id, locations }) => {
      lines.push(`  ID: "${id}" встречается ${locations.length} раз:`);
      locations.forEach((location) => {
        lines.push(`    - ${location}`);
      });
    });
    lines.push('');
  }

  // Дубликаты по комбинации english + translation
  if (result.duplicateEnglishTranslation.length > 0) {
    lines.push('⚠️  ДУБЛИКАТЫ ПО КОМБИНАЦИИ (english + translation):');
    result.duplicateEnglishTranslation.forEach(({ english, translation, locations }) => {
      lines.push(`  "${english}" → "${translation}" встречается ${locations.length} раз:`);
      locations.forEach((location) => {
        lines.push(`    - ${location}`);
      });
    });
    lines.push('');
  }

  // Слова с одинаковым английским (но разным переводом - это нормально)
  if (result.duplicateEnglish.length > 0) {
    lines.push('ℹ️  СЛОВА С ОДИНАКОВЫМ АНГЛИЙСКИМ (но разным переводом - это нормально):');
    result.duplicateEnglish.slice(0, 10).forEach(({ english, locations }) => {
      lines.push(`  "${english}" встречается в ${locations.length} местах:`);
      locations.forEach((location) => {
        lines.push(`    - ${location}`);
      });
    });
    if (result.duplicateEnglish.length > 10) {
      lines.push(`  ... и еще ${result.duplicateEnglish.length - 10} слов`);
    }
    lines.push('');
  }

  // Слова в разных категориях одной коллекции
  if (result.wordsInMultipleCategories.length > 0) {
    lines.push('📝 СЛОВА В РАЗНЫХ КАТЕГОРИЯХ ОДНОЙ КОЛЛЕКЦИИ:');
    result.wordsInMultipleCategories.forEach(({ word, categories }) => {
      lines.push(`  "${word.english}" (ID: ${word.id}) в категориях: ${categories.join(', ')}`);
    });
    lines.push('');
  }

  // Итог
  if (result.hasDuplicates) {
    lines.push('❌ ОБНАРУЖЕНЫ ДУБЛИКАТЫ!');
  } else {
    lines.push('✅ ДУБЛИКАТОВ НЕ ОБНАРУЖЕНО');
  }

  lines.push('='.repeat(60));

  return lines.join('\n');
}

/**
 * Проверить модуль и вывести отчет в консоль
 */
export function checkAndReport(module: VocabularyModule): DuplicateCheckResult {
  const result = checkDuplicates(module);
  console.log(formatDuplicateReport(result));
  return result;
}


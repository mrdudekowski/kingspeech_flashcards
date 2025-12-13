/**
 * Скрипт для проверки дубликатов в модуле A1
 * Проверяет:
 * - Дубликаты ID слов
 * - Дубликаты английских слов
 * - Корректность категорий
 * - Консистентность данных
 */

const fs = require('fs');
const path = require('path');

const A1_DIR = path.join(__dirname, '..', 'src', 'data', 'modules', 'A1');
const INDEX_PATH = path.join(A1_DIR, 'index.json');

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

/**
 * Загружает модуль A1 и все его коллекции
 */
function loadA1Module() {
  try {
    const indexData = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));
    const collections = [];

    for (const collectionMeta of indexData.collections) {
      if (collectionMeta.file) {
        const collectionPath = path.join(A1_DIR, collectionMeta.file);
        try {
          const collectionData = JSON.parse(fs.readFileSync(collectionPath, 'utf-8'));
          collections.push({
            ...collectionMeta,
            ...collectionData,
          });
        } catch (err) {
          log(colors.red, `❌ Ошибка загрузки коллекции ${collectionMeta.id}:`, err.message);
        }
      }
    }

    return { ...indexData, collections };
  } catch (err) {
    log(colors.red, '❌ Ошибка загрузки модуля A1:', err.message);
    process.exit(1);
  }
}

/**
 * Извлекает все слова из модуля
 */
function extractAllWords(module) {
  const words = [];

  for (const collection of module.collections) {
    if (collection.categories) {
      for (const [category, categoryWords] of Object.entries(collection.categories)) {
        for (const word of categoryWords) {
          words.push({
            ...word,
            collectionId: collection.id,
            collectionName: collection.name,
          });
        }
      }
    }
  }

  return words;
}

/**
 * Проверяет дубликаты ID
 */
function checkDuplicateIds(words) {
  const idMap = new Map();
  const duplicates = [];

  for (const word of words) {
    if (idMap.has(word.id)) {
      duplicates.push({
        id: word.id,
        english: word.english,
        firstOccurrence: idMap.get(word.id),
        secondOccurrence: {
          collection: word.collectionId,
          category: word.category,
        },
      });
    } else {
      idMap.set(word.id, {
        collection: word.collectionId,
        category: word.category,
      });
    }
  }

  return duplicates;
}

/**
 * Проверяет дубликаты английских слов
 */
function checkDuplicateEnglishWords(words) {
  const englishMap = new Map();
  const duplicates = [];

  for (const word of words) {
    const normalizedEnglish = word.english.toLowerCase().trim();
    
    if (englishMap.has(normalizedEnglish)) {
      const existing = englishMap.get(normalizedEnglish);
      duplicates.push({
        english: word.english,
        occurrences: [
          ...existing,
          {
            id: word.id,
            collection: word.collectionId,
            category: word.category,
            translation: word.translation,
          },
        ],
      });
      englishMap.set(normalizedEnglish, [
        ...existing,
        {
          id: word.id,
          collection: word.collectionId,
          category: word.category,
          translation: word.translation,
        },
      ]);
    } else {
      englishMap.set(normalizedEnglish, [
        {
          id: word.id,
          collection: word.collectionId,
          category: word.category,
          translation: word.translation,
        },
      ]);
    }
  }

  return Array.from(englishMap.entries())
    .filter(([_, occurrences]) => occurrences.length > 1)
    .map(([english, occurrences]) => ({ english, occurrences }));
}

/**
 * Проверяет корректность категорий
 */
function checkCategories(words) {
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

  const invalidCategories = [];
  const categoryStats = new Map();

  for (const word of words) {
    if (!validCategories.includes(word.category)) {
      invalidCategories.push({
        id: word.id,
        english: word.english,
        category: word.category,
        collection: word.collectionId,
      });
    }

    const count = categoryStats.get(word.category) || 0;
    categoryStats.set(word.category, count + 1);
  }

  return { invalidCategories, categoryStats };
}

/**
 * Проверяет консистентность данных
 */
function checkConsistency(words) {
  const issues = [];

  for (const word of words) {
    // Проверка обязательных полей
    if (!word.id || !word.english || !word.translation || !word.category) {
      issues.push({
        type: 'missing-required-field',
        id: word.id || 'unknown',
        english: word.english || 'unknown',
        collection: word.collectionId,
      });
    }

    // Проверка irregularForms для глаголов
    if (word.category === 'verbs' && word.subcategory === 'irregularVerbs' && !word.irregularForms) {
      issues.push({
        type: 'missing-irregular-forms',
        id: word.id,
        english: word.english,
        collection: word.collectionId,
        subcategory: word.subcategory,
      });
    }

    // Проверка тегов
    if (word.tags && (!Array.isArray(word.tags) || word.tags.length === 0)) {
      issues.push({
        type: 'invalid-tags',
        id: word.id,
        english: word.english,
        collection: word.collectionId,
      });
    }
  }

  return issues;
}

/**
 * Главная функция
 */
function main() {
  log(colors.cyan, '\n🔍 Проверка модуля A1 на дубликаты и консистентность...\n');

  // Загружаем модуль
  const module = loadA1Module();
  const words = extractAllWords(module);

  log(colors.blue, `📦 Загружено коллекций: ${module.collections.length}`);
  log(colors.blue, `📝 Загружено слов: ${words.length}\n`);

  // Проверка дубликатов ID
  log(colors.cyan, '1️⃣  Проверка дубликатов ID...');
  const duplicateIds = checkDuplicateIds(words);
  if (duplicateIds.length === 0) {
    log(colors.green, '✅ Дубликатов ID не найдено');
  } else {
    log(colors.red, `❌ Найдено дубликатов ID: ${duplicateIds.length}`);
    duplicateIds.forEach((dup) => {
      console.log(`   ID: "${dup.id}" (${dup.english})`);
      console.log(`     1️⃣  ${dup.firstOccurrence.collection} (${dup.firstOccurrence.category})`);
      console.log(`     2️⃣  ${dup.secondOccurrence.collection} (${dup.secondOccurrence.category})`);
    });
  }

  // Проверка дубликатов английских слов
  log(colors.cyan, '\n2️⃣  Проверка дубликатов английских слов...');
  const duplicateEnglish = checkDuplicateEnglishWords(words);
  if (duplicateEnglish.length === 0) {
    log(colors.green, '✅ Дубликатов английских слов не найдено');
  } else {
    log(colors.yellow, `⚠️  Найдено потенциальных дубликатов: ${duplicateEnglish.length}`);
    log(colors.yellow, '   (Некоторые дубликаты могут быть допустимыми, если слово имеет разные значения)');
    duplicateEnglish.slice(0, 10).forEach((dup) => {
      console.log(`\n   "${dup.english}" (${dup.occurrences.length} вхождений):`);
      dup.occurrences.forEach((occ, idx) => {
        console.log(`     ${idx + 1}. [${occ.id}] ${occ.collection} (${occ.category}): "${occ.translation}"`);
      });
    });
    if (duplicateEnglish.length > 10) {
      console.log(`\n   ... и ещё ${duplicateEnglish.length - 10} дубликатов`);
    }
  }

  // Проверка категорий
  log(colors.cyan, '\n3️⃣  Проверка категорий...');
  const { invalidCategories, categoryStats } = checkCategories(words);
  if (invalidCategories.length === 0) {
    log(colors.green, '✅ Все категории валидны');
    console.log('\n   Статистика по категориям:');
    Array.from(categoryStats.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`     ${category.padEnd(15)}: ${count} слов`);
      });
  } else {
    log(colors.red, `❌ Найдено невалидных категорий: ${invalidCategories.length}`);
    invalidCategories.forEach((issue) => {
      console.log(`   [${issue.id}] ${issue.english} в ${issue.collection}: категория "${issue.category}"`);
    });
  }

  // Проверка консистентности
  log(colors.cyan, '\n4️⃣  Проверка консистентности данных...');
  const consistencyIssues = checkConsistency(words);
  if (consistencyIssues.length === 0) {
    log(colors.green, '✅ Все данные консистентны');
  } else {
    log(colors.yellow, `⚠️  Найдено проблем: ${consistencyIssues.length}`);
    const issuesByType = new Map();
    consistencyIssues.forEach((issue) => {
      const count = issuesByType.get(issue.type) || 0;
      issuesByType.set(issue.type, count + 1);
    });
    console.log('\n   Проблемы по типам:');
    issuesByType.forEach((count, type) => {
      console.log(`     ${type}: ${count}`);
    });
    
    // Детализация для missing-irregular-forms
    const irregularFormIssues = consistencyIssues.filter(i => i.type === 'missing-irregular-forms');
    if (irregularFormIssues.length > 0) {
      console.log('\n   Глаголы без irregularForms:');
      irregularFormIssues.forEach(issue => {
        console.log(`     [${issue.id}] ${issue.english} в ${issue.collection}`);
      });
    }
  }

  // Итоговый отчёт
  log(colors.cyan, '\n' + '='.repeat(60));
  const totalIssues = duplicateIds.length + invalidCategories.length + consistencyIssues.length;
  if (totalIssues === 0) {
    log(colors.green, '✅ Модуль A1 прошёл все проверки успешно!');
  } else {
    log(colors.yellow, `⚠️  Найдено проблем: ${totalIssues}`);
    console.log(`   - Дубликаты ID: ${duplicateIds.length}`);
    console.log(`   - Невалидные категории: ${invalidCategories.length}`);
    console.log(`   - Проблемы консистентности: ${consistencyIssues.length}`);
    console.log(`   - Дубликаты английских слов: ${duplicateEnglish.length} (проверьте вручную)`);
  }
  log(colors.cyan, '='.repeat(60) + '\n');

  process.exit(totalIssues > 0 ? 1 : 0);
}

// Запуск
main();

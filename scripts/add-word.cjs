/**
 * Скрипт для добавления слова в коллекцию
 * Использование: node scripts/add-word.cjs --collection <collectionId> --english <word> --translation <translation> --category <category> [опции]
 */

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace(/^--/, '');
    const value = args[i + 1];
    if (key && value) {
      options[key] = value;
    }
  }
  
  return options;
}

function generateWordId(english, existingIds) {
  const baseId = english.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  let id = `${baseId}-1`;
  let counter = 1;
  
  while (existingIds.includes(id)) {
    counter++;
    id = `${baseId}-${counter}`;
  }
  
  return id;
}

function getAllWordIds(modulePath) {
  const indexFile = path.join(modulePath, 'index.json');
  const index = JSON.parse(fs.readFileSync(indexFile, 'utf-8'));
  const collectionsDir = path.join(modulePath, 'collections');
  const ids = new Set();
  
  index.collections.forEach(collectionMeta => {
    if (collectionMeta.file) {
      const collectionFile = path.join(modulePath, collectionMeta.file.replace('./', ''));
      if (fs.existsSync(collectionFile)) {
        const collection = JSON.parse(fs.readFileSync(collectionFile, 'utf-8'));
        if (collection.categories) {
          Object.values(collection.categories).forEach(words => {
            words.forEach(word => ids.add(word.id));
          });
        }
      }
    }
  });
  
  return Array.from(ids);
}

function addWord(options) {
  const { collection, english, translation, category, subcategory, definition, example, tags, past, pastParticiple } = options;
  
  if (!collection || !english || !translation || !category) {
    console.error('Ошибка: обязательные параметры: --collection, --english, --translation, --category');
    process.exit(1);
  }
  
  const validCategories = ['phrases', 'verbs', 'nouns', 'adjectives'];
  if (!validCategories.includes(category)) {
    console.error(`Ошибка: category должна быть одной из: ${validCategories.join(', ')}`);
    process.exit(1);
  }
  
  const modulePath = path.join(__dirname, '../src/data/modules/A1');
  const collectionsDir = path.join(modulePath, 'collections');
  const collectionFile = path.join(collectionsDir, `${collection}.json`);
  
  if (!fs.existsSync(collectionFile)) {
    console.error(`Ошибка: коллекция "${collection}" не найдена`);
    process.exit(1);
  }
  
  // Загружаем коллекцию
  const collectionData = JSON.parse(fs.readFileSync(collectionFile, 'utf-8'));
  
  // Получаем все существующие ID
  const existingIds = getAllWordIds(modulePath);
  
  // Создаем новое слово
  const newWord = {
    id: generateWordId(english, existingIds),
    english,
    translation,
    category,
  };
  
  if (subcategory) newWord.subcategory = subcategory;
  if (definition) newWord.definition = definition;
  if (example) newWord.example = example;
  
  // Обрабатываем теги
  const wordTags = tags ? tags.split(',').map(t => t.trim()) : [];
  if (wordTags.length > 0) {
    newWord.tags = [...new Set(wordTags)]; // Убираем дубликаты
  }
  
  // Обрабатываем неправильные формы глагола
  if (past && pastParticiple) {
    newWord.irregularForms = { past, pastParticiple };
  }
  
  // Добавляем слово в коллекцию
  if (!collectionData.categories) {
    collectionData.categories = {};
  }
  if (!collectionData.categories[category]) {
    collectionData.categories[category] = [];
  }
  collectionData.categories[category].push(newWord);
  
  // Сохраняем коллекцию
  fs.writeFileSync(
    collectionFile,
    JSON.stringify(collectionData, null, 2) + '\n',
    'utf-8'
  );
  
  console.log(`✓ Слово "${english}" добавлено в коллекцию "${collection}" с ID: ${newWord.id}`);
}

const options = parseArgs();
addWord(options);


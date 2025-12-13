/**
 * Скрипт для валидации словарных модулей
 * Проверяет структуру, уникальность ID и соответствие схемам
 */

const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, '../src/data/modules');

function validateWord(word, collectionId) {
  const errors = [];
  
  if (!word.id || typeof word.id !== 'string') {
    errors.push(`Слово без ID в коллекции ${collectionId}`);
  }
  
  if (!word.english || typeof word.english !== 'string') {
    errors.push(`Слово ${word.id || 'без ID'} без english в коллекции ${collectionId}`);
  }
  
  if (!word.translation || typeof word.translation !== 'string') {
    errors.push(`Слово ${word.id || 'без ID'} без translation в коллекции ${collectionId}`);
  }
  
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
    'determiners'
  ];
  if (!word.category || !validCategories.includes(word.category)) {
    errors.push(`Слово ${word.id || 'без ID'} имеет невалидную category "${word.category}" в коллекции ${collectionId}`);
  }
  
  return errors;
}

function validateCollection(collection, collectionId) {
  const errors = [];
  
  if (!collection.id || collection.id !== collectionId) {
    errors.push(`Несоответствие ID коллекции: ожидался "${collectionId}", получен "${collection.id}"`);
  }
  
  if (!collection.name || typeof collection.name !== 'string') {
    errors.push(`Коллекция ${collectionId} без name`);
  }
  
  if (!collection.categories || typeof collection.categories !== 'object') {
    errors.push(`Коллекция ${collectionId} без categories`);
    return errors;
  }
  
  // Валидация слов
  Object.entries(collection.categories).forEach(([category, words]) => {
    if (!Array.isArray(words)) {
      errors.push(`Категория "${category}" в коллекции ${collectionId} не является массивом`);
      return;
    }
    
    words.forEach(word => {
      errors.push(...validateWord(word, collectionId));
    });
  });
  
  return errors;
}

function validateModule(modulePath) {
  const errors = [];
  const indexFile = path.join(modulePath, 'index.json');
  
  if (!fs.existsSync(indexFile)) {
    errors.push(`Модуль не найден: ${indexFile}`);
    return errors;
  }
  
  const index = JSON.parse(fs.readFileSync(indexFile, 'utf-8'));
  const moduleId = path.basename(modulePath);
  
  if (!index.moduleId || index.moduleId !== moduleId) {
    errors.push(`Несоответствие moduleId: ожидался "${moduleId}", получен "${index.moduleId}"`);
  }
  
  if (!index.collections || !Array.isArray(index.collections)) {
    errors.push(`Модуль ${moduleId} без collections`);
    return errors;
  }
  
  // Проверка уникальности collection.id
  const collectionIds = new Set();
  index.collections.forEach(collectionMeta => {
    if (collectionIds.has(collectionMeta.id)) {
      errors.push(`Дубликат collection.id: "${collectionMeta.id}" в модуле ${moduleId}`);
    }
    collectionIds.add(collectionMeta.id);
    
    // Проверка существования файла коллекции
    if (collectionMeta.file) {
      const collectionFile = path.join(modulePath, collectionMeta.file.replace('./', ''));
      if (!fs.existsSync(collectionFile)) {
        errors.push(`Файл коллекции не найден: ${collectionFile}`);
      } else {
        // Валидация коллекции
        const collection = JSON.parse(fs.readFileSync(collectionFile, 'utf-8'));
        errors.push(...validateCollection(collection, collectionMeta.id));
      }
    }
  });
  
  // Проверка уникальности word.id в модуле
  const wordIds = new Set();
  index.collections.forEach(collectionMeta => {
    if (collectionMeta.file) {
      const collectionFile = path.join(modulePath, collectionMeta.file.replace('./', ''));
      if (fs.existsSync(collectionFile)) {
        const collection = JSON.parse(fs.readFileSync(collectionFile, 'utf-8'));
        if (collection.categories) {
          Object.values(collection.categories).forEach(words => {
            words.forEach(word => {
              if (wordIds.has(word.id)) {
                errors.push(`Дубликат word.id: "${word.id}" в модуле ${moduleId}`);
              }
              wordIds.add(word.id);
            });
          });
        }
      }
    }
  });
  
  return errors;
}

// Основная функция
function main() {
  const modules = fs.readdirSync(modulesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  if (modules.length === 0) {
    console.log('Модули не найдены');
    return;
  }
  
  console.log(`Проверка модулей: ${modules.join(', ')}\n`);
  
  let totalErrors = 0;
  
  modules.forEach(moduleId => {
    const modulePath = path.join(modulesDir, moduleId);
    const errors = validateModule(modulePath);
    
    if (errors.length > 0) {
      console.log(`❌ Модуль ${moduleId}:`);
      errors.forEach(error => console.log(`   ${error}`));
      totalErrors += errors.length;
    } else {
      console.log(`✓ Модуль ${moduleId}: OK`);
    }
  });
  
  console.log(`\n${totalErrors === 0 ? '✓ Все модули валидны' : `❌ Найдено ошибок: ${totalErrors}`}`);
  process.exit(totalErrors > 0 ? 1 : 0);
}

main();


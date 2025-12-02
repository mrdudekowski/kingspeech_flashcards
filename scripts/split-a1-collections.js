/**
 * Скрипт для разбиения A1/index.json на отдельные файлы коллекций
 * Использование: node scripts/split-a1-collections.js
 */

const fs = require('fs');
const path = require('path');

const modulePath = path.join(__dirname, '../src/data/modules/A1');
const indexFile = path.join(modulePath, 'index.json');
const collectionsDir = path.join(modulePath, 'collections');

// Создаем папку collections, если её нет
if (!fs.existsSync(collectionsDir)) {
  fs.mkdirSync(collectionsDir, { recursive: true });
}

// Читаем исходный файл
const moduleData = JSON.parse(fs.readFileSync(indexFile, 'utf-8'));

// Создаем новый index.json с метаданными
const newIndex = {
  moduleId: moduleData.moduleId,
  name: moduleData.name,
  description: moduleData.description,
  collections: []
};

// Разбиваем коллекции на отдельные файлы
moduleData.collections.forEach(collection => {
  const collectionFile = path.join(collectionsDir, `${collection.id}.json`);
  
  // Сохраняем коллекцию в отдельный файл
  fs.writeFileSync(
    collectionFile,
    JSON.stringify(collection, null, 2) + '\n',
    'utf-8'
  );
  
  // Добавляем ссылку в новый index.json
  newIndex.collections.push({
    id: collection.id,
    name: collection.name,
    description: collection.description,
    file: `./collections/${collection.id}.json`
  });
  
  console.log(`✓ Создан файл: ${collection.id}.json`);
});

// Сохраняем новый index.json
fs.writeFileSync(
  indexFile,
  JSON.stringify(newIndex, null, 2) + '\n',
  'utf-8'
);

console.log(`\n✓ Обновлен index.json`);
console.log(`✓ Всего коллекций: ${newIndex.collections.length}`);


/**
 * Тестовый скрипт для проверки загрузки коллекций
 * Симулирует работу vocabularyLoader
 */

const fs = require('fs');
const path = require('path');

const modulePath = path.join(__dirname, '../src/data/modules/A1');
const indexFile = path.join(modulePath, 'index.json');
const collectionsDir = path.join(modulePath, 'collections');

// Загружаем index.json
const index = JSON.parse(fs.readFileSync(indexFile, 'utf-8'));

console.log('🔍 Проверка загрузки коллекций модуля A1:\n');
console.log('='.repeat(70));

let totalWords = 0;
let errors = [];

index.collections.forEach(collectionMeta => {
  const collectionFile = path.join(modulePath, collectionMeta.file.replace('./', ''));
  
  if (!fs.existsSync(collectionFile)) {
    errors.push(`❌ ${collectionMeta.name}: файл не найден - ${collectionMeta.file}`);
    return;
  }
  
  try {
    const collection = JSON.parse(fs.readFileSync(collectionFile, 'utf-8'));
    
    // Проверяем соответствие ID
    if (collection.id !== collectionMeta.id) {
      errors.push(`⚠️  ${collectionMeta.name}: несоответствие ID (${collection.id} vs ${collectionMeta.id})`);
    }
    
    // Подсчитываем слова
    let collectionWords = 0;
    const categoryCounts = {};
    
    if (collection.categories) {
      Object.entries(collection.categories).forEach(([category, words]) => {
        categoryCounts[category] = words.length;
        collectionWords += words.length;
      });
    }
    
    totalWords += collectionWords;
    
    const status = collectionWords > 0 ? '✓' : '⚠️';
    const categoryStr = Object.entries(categoryCounts)
      .map(([cat, count]) => `${cat}:${count}`)
      .join(', ') || 'нет категорий';
    
    console.log(`${status} ${collectionMeta.name.padEnd(30)} ${collectionWords.toString().padStart(4)} слов [${categoryStr}]`);
    
  } catch (error) {
    errors.push(`❌ ${collectionMeta.name}: ошибка загрузки - ${error.message}`);
  }
});

console.log('='.repeat(70));
console.log(`Всего слов: ${totalWords}`);
console.log(`Всего коллекций: ${index.collections.length}`);

if (errors.length > 0) {
  console.log('\n⚠️  Обнаружены проблемы:');
  errors.forEach(err => console.log(`  ${err}`));
} else {
  console.log('\n✅ Все коллекции загружены успешно!');
}


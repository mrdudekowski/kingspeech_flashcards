/**
 * Скрипт для подсчета слов в каждой коллекции модуля A1
 */

const fs = require('fs');
const path = require('path');

const modulePath = path.join(__dirname, '../src/data/modules/A1');
const indexFile = path.join(modulePath, 'index.json');
const collectionsDir = path.join(modulePath, 'collections');

const index = JSON.parse(fs.readFileSync(indexFile, 'utf-8'));

console.log('📊 Статистика коллекций модуля A1:\n');
console.log('='.repeat(60));

let totalWords = 0;

index.collections.forEach(collectionMeta => {
  const collectionFile = path.join(modulePath, collectionMeta.file.replace('./', ''));
  if (fs.existsSync(collectionFile)) {
    const collection = JSON.parse(fs.readFileSync(collectionFile, 'utf-8'));
    
    const counts = {};
    let collectionTotal = 0;
    
    if (collection.categories) {
      Object.entries(collection.categories).forEach(([category, words]) => {
        counts[category] = words.length;
        collectionTotal += words.length;
      });
    }
    
    totalWords += collectionTotal;
    
    const categoryStr = Object.entries(counts)
      .map(([cat, count]) => `${cat}: ${count}`)
      .join(', ');
    
    const status = collectionTotal > 0 ? '✓' : '⚠️';
    console.log(`${status} ${collectionMeta.name.padEnd(30)} ${collectionTotal.toString().padStart(4)} слов (${categoryStr})`);
  } else {
    console.log(`❌ ${collectionMeta.name.padEnd(30)} ФАЙЛ НЕ НАЙДЕН`);
  }
});

console.log('='.repeat(60));
console.log(`Всего слов в модуле A1: ${totalWords}`);


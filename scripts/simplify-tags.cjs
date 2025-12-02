/**
 * Скрипт для упрощения тегов в коллекциях A1
 * Удаляет дублирующие collectionId и moduleId из тегов
 */

const fs = require('fs');
const path = require('path');

const collectionsDir = path.join(__dirname, '../src/data/modules/A1/collections');
const moduleId = 'A1';

// Получаем все файлы коллекций
const collectionFiles = fs.readdirSync(collectionsDir).filter(f => f.endsWith('.json'));

let totalWordsProcessed = 0;
let totalTagsRemoved = 0;

collectionFiles.forEach(file => {
  const filePath = path.join(collectionsDir, file);
  const collection = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const collectionId = collection.id;
  
  let wordsProcessed = 0;
  let tagsRemoved = 0;
  
  // Обрабатываем все категории
  if (collection.categories) {
    Object.values(collection.categories).forEach(words => {
      words.forEach(word => {
        if (word.tags && Array.isArray(word.tags)) {
          const originalTags = [...word.tags];
          
          // Удаляем collectionId и moduleId из тегов
          word.tags = word.tags.filter(tag => 
            tag !== collectionId && tag !== moduleId
          );
          
          // Если теги стали пустыми, удаляем поле tags
          if (word.tags.length === 0) {
            delete word.tags;
          }
          
          wordsProcessed++;
          const removed = originalTags.length - (word.tags?.length || 0);
          tagsRemoved += removed;
        }
      });
    });
  }
  
  // Сохраняем обновленную коллекцию
  fs.writeFileSync(
    filePath,
    JSON.stringify(collection, null, 2) + '\n',
    'utf-8'
  );
  
  console.log(`✓ ${file}: обработано ${wordsProcessed} слов, удалено ${tagsRemoved} тегов`);
  totalWordsProcessed += wordsProcessed;
  totalTagsRemoved += tagsRemoved;
});

console.log(`\n✓ Всего обработано слов: ${totalWordsProcessed}`);
console.log(`✓ Всего удалено тегов: ${totalTagsRemoved}`);


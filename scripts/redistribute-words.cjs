/**
 * Скрипт для перераспределения слов из basic-verbs и daily-life
 * в соответствующие коллекции на основе subcategory
 */

const fs = require('fs');
const path = require('path');

const modulePath = path.join(__dirname, '../src/data/modules/A1');
const collectionsDir = path.join(modulePath, 'collections');

// Маппинг subcategory -> collectionId
const SUBCATEGORY_TO_COLLECTION = {
  // Из basic-verbs
  'irregularVerbs': 'irregular-verbs',
  'modalVerbs': 'modal-verbs',
  'phrasalVerbs': 'phrasal-verbs',
  
  // Из daily-life
  'collocations': 'collocations',
  'expressions': 'expressions',
  'phrasesCommon': 'common-phrases',
  'phrasesFormal': 'formal-phrases',
  'phrasesInformal': 'informal-phrases',
};

function loadCollection(collectionId) {
  const filePath = path.join(collectionsDir, `${collectionId}.json`);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function saveCollection(collection) {
  const filePath = path.join(collectionsDir, `${collection.id}.json`);
  fs.writeFileSync(
    filePath,
    JSON.stringify(collection, null, 2) + '\n',
    'utf-8'
  );
}

function redistributeWords() {
  console.log('🔄 Начинаю перераспределение слов...\n');
  
  // Загружаем исходные коллекции
  const basicVerbs = loadCollection('basic-verbs');
  const dailyLife = loadCollection('daily-life');
  
  // Загружаем целевые коллекции
  const targetCollections = {};
  Object.values(SUBCATEGORY_TO_COLLECTION).forEach(collectionId => {
    targetCollections[collectionId] = loadCollection(collectionId);
  });
  
  let totalMoved = 0;
  
  // Обрабатываем basic-verbs
  console.log('📦 Обработка basic-verbs...');
  if (basicVerbs.categories && basicVerbs.categories.verbs) {
    const verbsToKeep = [];
    const verbsToMove = new Map();
    
    basicVerbs.categories.verbs.forEach(word => {
      if (word.subcategory && SUBCATEGORY_TO_COLLECTION[word.subcategory]) {
        const targetCollectionId = SUBCATEGORY_TO_COLLECTION[word.subcategory];
        if (!verbsToMove.has(targetCollectionId)) {
          verbsToMove.set(targetCollectionId, []);
        }
        verbsToMove.get(targetCollectionId).push(word);
        totalMoved++;
      } else {
        verbsToKeep.push(word);
      }
    });
    
    // Обновляем basic-verbs (оставляем только слова без специальных подкатегорий)
    basicVerbs.categories.verbs = verbsToKeep;
    saveCollection(basicVerbs);
    console.log(`  ✓ Оставлено в basic-verbs: ${verbsToKeep.length} слов`);
    
    // Перемещаем слова в целевые коллекции
    verbsToMove.forEach((words, targetCollectionId) => {
      const targetCollection = targetCollections[targetCollectionId];
      if (!targetCollection.categories) {
        targetCollection.categories = {};
      }
      if (!targetCollection.categories.verbs) {
        targetCollection.categories.verbs = [];
      }
      targetCollection.categories.verbs.push(...words);
      saveCollection(targetCollection);
      console.log(`  ✓ Перемещено в ${targetCollectionId}: ${words.length} слов`);
    });
  }
  
  // Обрабатываем daily-life
  console.log('\n📦 Обработка daily-life...');
  if (dailyLife.categories && dailyLife.categories.phrases) {
    const phrasesToKeep = [];
    const phrasesToMove = new Map();
    
    dailyLife.categories.phrases.forEach(word => {
      if (word.subcategory && SUBCATEGORY_TO_COLLECTION[word.subcategory]) {
        const targetCollectionId = SUBCATEGORY_TO_COLLECTION[word.subcategory];
        if (!phrasesToMove.has(targetCollectionId)) {
          phrasesToMove.set(targetCollectionId, []);
        }
        phrasesToMove.get(targetCollectionId).push(word);
        totalMoved++;
      } else {
        phrasesToKeep.push(word);
      }
    });
    
    // Обновляем daily-life (оставляем только фразы без специальных подкатегорий)
    dailyLife.categories.phrases = phrasesToKeep;
    saveCollection(dailyLife);
    console.log(`  ✓ Оставлено в daily-life: ${phrasesToKeep.length} фраз`);
    
    // Перемещаем фразы в целевые коллекции
    phrasesToMove.forEach((phrases, targetCollectionId) => {
      const targetCollection = targetCollections[targetCollectionId];
      if (!targetCollection.categories) {
        targetCollection.categories = {};
      }
      if (!targetCollection.categories.phrases) {
        targetCollection.categories.phrases = [];
      }
      targetCollection.categories.phrases.push(...phrases);
      saveCollection(targetCollection);
      console.log(`  ✓ Перемещено в ${targetCollectionId}: ${phrases.length} фраз`);
    });
  }
  
  console.log(`\n✅ Перераспределение завершено! Всего перемещено: ${totalMoved} слов/фраз`);
}

redistributeWords();


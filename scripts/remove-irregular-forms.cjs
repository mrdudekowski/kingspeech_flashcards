/**
 * Скрипт для удаления irregularForms из всех глаголов A1
 * и изменения subcategory с irregularVerbs на regularVerbs
 */

const fs = require('fs');
const path = require('path');

const collectionsDir = path.join(__dirname, '..', 'src', 'data', 'modules', 'A1', 'collections');

function main() {
  console.log('\n🔧 Удаление irregularForms из модуля A1...\n');
  
  const files = fs.readdirSync(collectionsDir).filter(f => f.endsWith('.json'));
  
  let totalRemoved = 0;
  let totalConverted = 0;
  let filesChanged = 0;

  files.forEach(file => {
    const filePath = path.join(collectionsDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    let fileChanged = false;
    
    if (data.categories) {
      Object.keys(data.categories).forEach(category => {
        data.categories[category].forEach(word => {
          if (word.irregularForms) {
            delete word.irregularForms;
            fileChanged = true;
            totalRemoved++;
          }
          if (word.subcategory === 'irregularVerbs') {
            word.subcategory = 'regularVerbs';
            fileChanged = true;
            totalConverted++;
          }
        });
      });
    }
    
    if (fileChanged) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
      console.log(`✅ ${file}: обновлён`);
      filesChanged++;
    }
  });

  console.log('\n📊 Итого:');
  console.log(`  - Файлов изменено: ${filesChanged}`);
  console.log(`  - Удалено irregularForms: ${totalRemoved}`);
  console.log(`  - Изменено subcategory: ${totalConverted}`);
  console.log('\n✅ Готово!\n');
}

main();

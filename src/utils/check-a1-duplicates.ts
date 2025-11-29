/**
 * Простой скрипт для проверки дубликатов в модуле A1
 * Можно запустить через: npx tsx src/utils/check-a1-duplicates.ts
 * Или использовать в браузере через импорт
 */

import { checkAndReport } from '@/shared/utils/duplicateChecker';
import { loadModule } from '@/services/vocabularyLoader';

async function checkA1() {
  console.log('🔍 Проверка дубликатов в модуле A1...\n');
  
  try {
    const module = await loadModule('A1');
    const result = checkAndReport(module);
    
    // Возвращаем результат для использования в других местах
    return result;
  } catch (error) {
    console.error('❌ Ошибка при проверке:', error);
    throw error;
  }
}

// Запуск при прямом вызове
if (import.meta.url === `file://${process.argv[1]}` || import.meta.url.includes('check-a1-duplicates')) {
  checkA1().catch(console.error);
}

export { checkA1 };


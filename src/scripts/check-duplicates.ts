/**
 * Скрипт для проверки дубликатов в модулях словаря
 * Запуск: npm run check-duplicates или tsx src/scripts/check-duplicates.ts
 */

import { checkAndReport } from '@/shared/utils/duplicateChecker';
import { loadModule } from '@/services/vocabularyLoader';
import { AVAILABLE_MODULES } from '@/app/constants';
import type { ModuleId } from '@/app/constants';

async function main() {
  console.log('🔍 Проверка дубликатов в модулях словаря...\n');

  for (const moduleId of AVAILABLE_MODULES) {
    try {
      console.log(`\n📦 Проверка модуля ${moduleId}...`);
      const module = await loadModule(moduleId as ModuleId);
      checkAndReport(module);
    } catch (error) {
      console.error(`❌ Ошибка при проверке модуля ${moduleId}:`, error);
    }
  }

  console.log('\n✅ Проверка завершена!');
}

// Запуск скрипта
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}


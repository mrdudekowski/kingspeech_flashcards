/**
 * Простая функция для тестирования проверки дубликатов
 * Можно вызвать из консоли браузера: window.checkDuplicates('A1')
 */

import { checkAndReport } from '@/shared/utils/duplicateChecker';
import { loadModule } from '@/services/vocabularyLoader';
import type { ModuleId } from '@/app/constants';

/**
 * Проверить модуль на дубликаты (для использования в консоли браузера)
 */
export async function checkDuplicatesForModule(moduleId: string) {
  try {
    const module = await loadModule(moduleId as ModuleId);
    return checkAndReport(module);
  } catch (error) {
    console.error('Ошибка при проверке модуля:', error);
    throw error;
  }
}

// Экспортируем в window для использования в консоли браузера (только в dev режиме)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).checkDuplicates = checkDuplicatesForModule;
  console.log('✅ Функция checkDuplicates доступна в консоли!');
  console.log('Использование: await checkDuplicates("A1")');
}


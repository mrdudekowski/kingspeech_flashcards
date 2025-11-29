/**
 * Типы для vocabulary feature
 */

import type { ModuleId, WordCategory, WordSubcategory } from '@/app/constants';
import type { VocabularyModule, AsyncState } from '@/shared/types';

/**
 * Состояние vocabulary slice
 */
export interface VocabularyState extends AsyncState {
  currentModule: ModuleId | null;
  currentCollection: string | null;
  currentCategory: WordCategory | null;
  currentSubcategory: WordSubcategory | string | null; // Подкатегория (может быть из констант или кастомная)
  vocabularyData: VocabularyModule | null;
}

/**
 * Типы для Progress Slice
 * Используем типы из shared/types для соблюдения Single Source of Truth
 */

import type { WordProgress, QuizResult, ProgressStatistics, WordStatus } from '@/shared/types';

/**
 * Прогресс одного профиля/ребёнка
 */
export interface ProfileProgressState {
  wordProgress: Record<string, WordProgress>;
  quizResults: QuizResult[];
  statistics: ProgressStatistics;
  wordStatuses: Record<string, WordStatus>;
}

export type ProgressProfilesMap = Record<string, ProfileProgressState>;

/**
 * Состояние прогресса в Redux store
 * Содержит несколько профилей + активный профиль
 */
export interface ProgressState {
  profiles: ProgressProfilesMap;
  activeProfileId: string;
  isLoading: boolean;
}


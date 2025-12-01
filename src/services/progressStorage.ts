/**
 * Progress Storage Service
 * Сервис для работы с localStorage для сохранения прогресса
 */

import { STORAGE_KEYS } from '@/app/constants';
import type { ProgressState, ProgressProfilesMap } from '@/features/progress/types';
import type { WordProgress, QuizResult, ProgressStatistics } from '@/shared/types';

const DEFAULT_PROFILE_ID = 'default';

type PersistedProgressPayload = {
  profiles: ProgressProfilesMap;
  activeProfileId?: string;
};

type LegacyProgressPayload = {
  wordProgress: Record<string, WordProgress>;
  quizResults: QuizResult[];
  statistics: ProgressStatistics;
};

/**
 * Сохранить прогресс в localStorage
 */
export function saveProgress(progress: ProgressState): void {
  try {
    const payload: PersistedProgressPayload = {
      profiles: progress.profiles,
      activeProfileId: progress.activeProfileId,
    };
    const serialized = JSON.stringify(payload);
    localStorage.setItem(STORAGE_KEYS.PROGRESS, serialized);
  } catch (error) {
    console.error('Ошибка сохранения прогресса:', error);
    // Не бросаем ошибку, чтобы не сломать приложение
  }
}

/**
 * Загрузить прогресс из localStorage
 */
export function loadProgress(): ProgressState | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (!serialized) {
      return null;
    }
    
    const parsed = JSON.parse(serialized) as PersistedProgressPayload | LegacyProgressPayload;
    
    if (isPersistedPayload(parsed)) {
      return {
        profiles: parsed.profiles,
        activeProfileId: parsed.activeProfileId || DEFAULT_PROFILE_ID,
        isLoading: false,
      };
    }
    
    if (isLegacyPayload(parsed)) {
      return {
        profiles: {
          [DEFAULT_PROFILE_ID]: {
            wordProgress: parsed.wordProgress,
            quizResults: parsed.quizResults,
            statistics: parsed.statistics,
            wordStatuses: {},
          },
        },
        activeProfileId: DEFAULT_PROFILE_ID,
        isLoading: false,
      };
    }
    
    // Если структура невалидна - очищаем и возвращаем null
    console.warn('Невалидная структура прогресса, очищаем');
    clearProgress();
    return null;
  } catch (error) {
    console.error('Ошибка загрузки прогресса:', error);
    return null;
  }
}

/**
 * Очистить прогресс из localStorage
 */
export function clearProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.PROGRESS);
  } catch (error) {
    console.error('Ошибка очистки прогресса:', error);
  }
}

function isPersistedPayload(payload: unknown): payload is PersistedProgressPayload {
  if (!payload || typeof payload !== 'object') {
    return false;
  }
  if (!('profiles' in payload)) {
    return false;
  }
  const profiles = (payload as PersistedProgressPayload).profiles;
  return typeof profiles === 'object' && profiles !== null;
}

function isLegacyPayload(payload: unknown): payload is LegacyProgressPayload {
  if (!payload || typeof payload !== 'object') {
    return false;
  }
  const candidate = payload as Record<string, unknown>;
  return (
    typeof candidate.wordProgress === 'object' &&
    candidate.wordProgress !== null &&
    Array.isArray(candidate.quizResults) &&
    typeof candidate.statistics === 'object' &&
    candidate.statistics !== null
  );
}


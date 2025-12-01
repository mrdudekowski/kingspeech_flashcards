/**
 * Progress Middleware
 * Автоматически сохраняет прогресс в localStorage при изменении
 */

import type { Middleware } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';
import { saveProgress } from '@/services/progressStorage';
import {
  markWordStudied,
  updateWordProgress,
  saveQuizResult,
  setActiveProfile,
  clearProgress,
  setWordStatus,
  resetWordsProgress,
} from '@/features/progress/progressSlice';

// Простой дебаунс для сохранения прогресса,
// чтобы не писать в localStorage после каждого клика
let saveTimeoutId: number | undefined;
const SAVE_DEBOUNCE_MS = 300;

export const progressMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  const shouldSave =
    markWordStudied.match(action) ||
    updateWordProgress.match(action) ||
    saveQuizResult.match(action) ||
    setActiveProfile.match(action) ||
    clearProgress.match(action) ||
    setWordStatus.match(action) ||
    resetWordsProgress.match(action);

  if (shouldSave) {
    if (saveTimeoutId !== undefined) {
      clearTimeout(saveTimeoutId);
    }

    saveTimeoutId = window.setTimeout(() => {
      const state = store.getState() as RootState;
      if (state.progress) {
        saveProgress(state.progress);
      }
    }, SAVE_DEBOUNCE_MS);
  }

  return result;
};


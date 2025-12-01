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
} from '@/features/progress/progressSlice';

export const progressMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // Сохраняем прогресс после определенных actions
  if (
    markWordStudied.match(action) ||
    updateWordProgress.match(action) ||
    saveQuizResult.match(action) ||
    setActiveProfile.match(action) ||
    clearProgress.match(action) ||
    setWordStatus.match(action)
  ) {
    const state = store.getState() as RootState;
    if (state.progress) {
      saveProgress(state.progress);
    }
  }
  
  return result;
};


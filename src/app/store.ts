/**
 * Redux Store конфигурация
 * Централизованное управление состоянием приложения
 */

import { configureStore } from '@reduxjs/toolkit';
import vocabularyReducer from '@/features/vocabulary/vocabularySlice';
import flashcardsReducer from '@/features/flashcards/flashcardsSlice';
import progressReducer from '@/features/progress/progressSlice';
import quizzesReducer from '@/features/quizzes/quizzesSlice';
import { progressMiddleware } from './middleware/progressMiddleware';
import { loadProgress } from '@/services/progressStorage';
import { loadProgress as loadProgressAction } from '@/features/progress/progressSlice';

export const store = configureStore({
  reducer: {
    vocabulary: vocabularyReducer,
    flashcards: flashcardsReducer,
    progress: progressReducer,
    quizzes: quizzesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(progressMiddleware),
  // Redux DevTools автоматически включены в development режиме
  devTools: process.env.NODE_ENV !== 'production',
});

// Типы для использования в приложении
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/**
 * Инициализация прогресса при загрузке приложения
 * Загружает сохраненный прогресс из localStorage
 */
export function initializeProgress(): void {
  const savedProgress = loadProgress();
  if (savedProgress) {
    store.dispatch(
      loadProgressAction({
        profiles: savedProgress.profiles,
        activeProfileId: savedProgress.activeProfileId,
      })
    );
  }
}

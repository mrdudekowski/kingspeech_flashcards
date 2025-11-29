/**
 * Redux Store конфигурация
 * Централизованное управление состоянием приложения
 */

import { configureStore } from '@reduxjs/toolkit';
import vocabularyReducer from '@/features/vocabulary/vocabularySlice';
import flashcardsReducer from '@/features/flashcards/flashcardsSlice';

export const store = configureStore({
  reducer: {
    vocabulary: vocabularyReducer,
    flashcards: flashcardsReducer,
    // Будут добавлены по мере создания:
    // quizzes: quizzesReducer,
    // progress: progressReducer,
  },
  // Redux DevTools автоматически включены в development режиме
  devTools: process.env.NODE_ENV !== 'production',
});

// Типы для использования в приложении
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

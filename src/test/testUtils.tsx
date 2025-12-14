/**
 * Test Utilities
 * Утилиты для тестирования Redux компонентов
 */

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, type EnhancedStore } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';
import vocabularyReducer from '@/features/vocabulary/vocabularySlice';
import flashcardsReducer from '@/features/flashcards/flashcardsSlice';
import progressReducer from '@/features/progress/progressSlice';
import quizzesReducer from '@/features/quizzes/quizzesSlice';
import { progressMiddleware } from '@/app/middleware/progressMiddleware';

// Функция для создания тестового store
export function setupStore(): EnhancedStore<RootState> {
  return configureStore({
    reducer: {
      vocabulary: vocabularyReducer,
      flashcards: flashcardsReducer,
      progress: progressReducer,
      quizzes: quizzesReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(progressMiddleware),
  });
}

// Расширяем тип RenderOptions
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  store?: EnhancedStore<RootState>;
}

// Custom render для компонентов с Redux
export function renderWithProviders(
  ui: ReactElement,
  {
    store = setupStore(),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Экспортируем все из @testing-library/react
export * from '@testing-library/react';

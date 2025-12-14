/**
 * Конфигурация роутов приложения
 */

import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from '@/app/constants';
import RootLayout from './components/RootLayout';
import HomePage from './components/HomePage';
import ModuleLayout from './components/ModuleLayout';
import ModulePage from './components/ModulePage';
import CollectionPage from './components/CollectionPage';
import FlashcardsPage from './components/FlashcardsPage';
import QuizPage from './components/QuizPage';
import QuizSetupPage from './components/QuizSetupPage';

export const router = createBrowserRouter(
  [
    {
      path: ROUTES.HOME,
      element: <RootLayout />,
      children: [
        {
          index: true,
          element: <HomePage />,
        },
        {
          path: ROUTES.MODULE,
          element: <ModuleLayout />,
          children: [
            {
              index: true,
              element: <ModulePage />,
            },
            {
              path: ':collectionId',
              element: <CollectionPage />,
            },
          ],
        },
        {
          path: ROUTES.FLASHCARDS,
          element: <FlashcardsPage />,
        },
        {
          path: '/quiz/:moduleId/setup',
          element: <QuizSetupPage />,
        },
        {
          path: '/quiz/:moduleId/:collectionId?/setup',
          element: <QuizSetupPage />,
        },
        {
          path: ROUTES.QUIZ,
          element: <QuizPage />,
        },
      ],
    },
  ],
  {
    basename: '/kingspeech_flashcards',
  }
);
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

export const router = createBrowserRouter([
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
    ],
  },
], {
  basename: '/kingspeech_flashcards', // Добавьте эту строку
});
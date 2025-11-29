/**
 * RootLayout - корневой layout приложения
 * Содержит общую навигацию и структуру страниц
 */

import { Outlet, Link } from 'react-router-dom';
import { ROUTES } from '@/app/constants';

function RootLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header с названием приложения */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <Link
            to={ROUTES.HOME}
            className="text-2xl font-bold text-gray-800 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            📚 English Learning App
          </Link>
        </div>
      </header>

      {/* Основной контент */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default RootLayout;


/**
 * RootLayout - корневой layout приложения
 * Содержит общую навигацию и структуру страниц
 */

import { Outlet } from 'react-router-dom';

function RootLayout() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      {/* Основной контент */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default RootLayout;


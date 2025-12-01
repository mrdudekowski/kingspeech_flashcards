import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { store, initializeProgress } from '@/app/store';
import { router } from './routes/routes';
import ErrorBoundary from '@/shared/components/ErrorBoundary';
import './index.css';

// Импортируем утилиту для проверки дубликатов (только в dev режиме)
if (process.env.NODE_ENV === 'development') {
  import('./utils/test-duplicates');
  
  // Логируем информацию о режиме разработки
  console.log('%c🔧 Режим разработки активен', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
  console.log('%c📊 Redux DevTools доступны', 'color: #2196F3; font-weight: bold;');
  console.log('%c🐛 Детальное логирование включено', 'color: #FF9800; font-weight: bold;');
}

// Инициализируем прогресс при загрузке приложения
try {
  initializeProgress();
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Прогресс инициализирован');
  }
} catch (error) {
  console.error('❌ Ошибка инициализации прогресса:', error);
}

// Глобальный обработчик необработанных ошибок
if (process.env.NODE_ENV === 'development') {
  window.addEventListener('error', (event) => {
    console.error('🚨 Глобальная ошибка:', event.error);
    console.error('📍 Файл:', event.filename, 'Строка:', event.lineno, 'Колонка:', event.colno);
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Необработанное Promise отклонение:', event.reason);
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
    <Provider store={store}>
        <RouterProvider
          router={router}
          future={{
            v7_startTransition: false,
          }}
        />
    </Provider>
    </ErrorBoundary>
  </React.StrictMode>,
);

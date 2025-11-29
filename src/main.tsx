import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { store } from '@/app/store';
import { router } from './routes/routes';
import './index.css';

// Импортируем утилиту для проверки дубликатов (только в dev режиме)
if (process.env.NODE_ENV === 'development') {
  import('./utils/test-duplicates');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
);

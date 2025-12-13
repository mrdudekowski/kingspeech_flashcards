/**
 * ModuleLayout - layout для страниц модуля
 * Содержит навигацию внутри модуля и breadcrumbs
 */

import { Outlet, useParams, Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/shared/hooks/redux';
import { 
  loadVocabularyModule, 
  selectVocabularyData, 
  selectLoading,
  selectError
} from '@/features/vocabulary/vocabularySlice';
import { useEffect } from 'react';
import type { ModuleId } from '@/app/constants';

function ModuleLayout() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const dispatch = useAppDispatch();
  const vocabularyData = useAppSelector(selectVocabularyData);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);

  // Загружаем модуль при монтировании или изменении moduleId
  useEffect(() => {
    if (moduleId && moduleId !== vocabularyData?.moduleId) {
      dispatch(loadVocabularyModule(moduleId as ModuleId));
    }
  }, [moduleId, dispatch, vocabularyData?.moduleId]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Idle - начальное состояние */}
      {loading === 'idle' && (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">
            Инициализация...
          </p>
        </div>
      )}

      {/* Loading - загрузка */}
      {loading === 'loading' && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Загрузка модуля {moduleId}...
          </p>
        </div>
      )}

      {/* Failed - ошибка загрузки */}
      {loading === 'failed' && (
        <div className="glass-strong rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              Ошибка загрузки модуля
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              {error || 'Неизвестная ошибка'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Модуль: {moduleId}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => dispatch(loadVocabularyModule(moduleId as ModuleId))}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
              >
                Попробовать снова
              </button>
              <Link
                to="/"
                className="px-6 py-3 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 rounded-lg font-semibold transition-colors"
              >
                На главную
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Succeeded - успешная загрузка */}
      {loading === 'succeeded' && vocabularyData && <Outlet />}
    </div>
  );
}

export default ModuleLayout;


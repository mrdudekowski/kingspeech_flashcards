/**
 * ModuleLayout - layout для страниц модуля
 * Содержит навигацию внутри модуля и breadcrumbs
 */

import { Outlet, useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/shared/hooks/redux';
import { loadVocabularyModule, selectVocabularyData, selectLoading } from '@/features/vocabulary/vocabularySlice';
import { useEffect } from 'react';
import type { ModuleId } from '@/app/constants';

function ModuleLayout() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const dispatch = useAppDispatch();
  const vocabularyData = useAppSelector(selectVocabularyData);
  const loading = useAppSelector(selectLoading);

  // Загружаем модуль при монтировании или изменении moduleId
  useEffect(() => {
    if (moduleId && moduleId !== vocabularyData?.moduleId) {
      dispatch(loadVocabularyModule(moduleId as ModuleId));
    }
  }, [moduleId, dispatch, vocabularyData?.moduleId]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Загрузка */}
      {loading === 'loading' && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Загрузка модуля...</p>
        </div>
      )}

      {/* Контент */}
      {loading === 'succeeded' && vocabularyData && <Outlet />}
    </div>
  );
}

export default ModuleLayout;


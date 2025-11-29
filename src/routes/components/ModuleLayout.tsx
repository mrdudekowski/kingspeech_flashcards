/**
 * ModuleLayout - layout для страниц модуля
 * Содержит навигацию внутри модуля и breadcrumbs
 */

import { Outlet, useParams, Link, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/shared/hooks/redux';
import { loadVocabularyModule, selectVocabularyData, selectLoading } from '@/features/vocabulary/vocabularySlice';
import { useEffect } from 'react';
import { ROUTES } from '@/app/constants';
import type { ModuleId } from '@/app/constants';

function ModuleLayout() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const dispatch = useAppDispatch();
  const vocabularyData = useAppSelector(selectVocabularyData);
  const loading = useAppSelector(selectLoading);
  const location = useLocation();

  // Загружаем модуль при монтировании или изменении moduleId
  useEffect(() => {
    if (moduleId && moduleId !== vocabularyData?.moduleId) {
      dispatch(loadVocabularyModule(moduleId as ModuleId));
    }
  }, [moduleId, dispatch, vocabularyData?.moduleId]);

  // Breadcrumbs
  const breadcrumbs = [
    { label: 'Home', path: ROUTES.HOME },
    { label: moduleId || 'Module', path: moduleId ? `/module/${moduleId}` : ROUTES.HOME },
  ];

  if (location.pathname.includes('/module/') && location.pathname.split('/').length > 3) {
    const collectionId = location.pathname.split('/')[3];
    breadcrumbs.push({
      label: collectionId || 'Collection',
      path: collectionId ? `/module/${moduleId}/${collectionId}` : `/module/${moduleId}`,
    });
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.path} className="flex items-center">
              {index > 0 && <span className="mx-2">/</span>}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-gray-800 font-medium">{crumb.label}</span>
              ) : (
                <Link to={crumb.path} className="hover:text-blue-600 transition-colors">
                  {crumb.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>

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


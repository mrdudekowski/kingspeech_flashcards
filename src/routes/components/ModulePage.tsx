/**
 * ModulePage - страница модуля
 * Отображает список подборок модуля
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/shared/hooks/redux';
import { selectVocabularyData, setCurrentCollection } from '@/features/vocabulary/vocabularySlice';
import { selectCurrentModuleProgress } from '@/features/progress/progressSlice';

function ModulePage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const vocabularyData = useAppSelector(selectVocabularyData);
  const moduleProgress = useAppSelector(selectCurrentModuleProgress);

  const handleCollectionSelect = (collectionId: string) => {
    dispatch(setCurrentCollection(collectionId));
    navigate(`/module/${moduleId}/${collectionId}`);
  };

  if (!vocabularyData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">Модуль не загружен</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Прогресс модуля слева */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="glass-strong rounded-xl p-6 shadow-lg sticky top-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Прогресс модуля
            </h3>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Завершено</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {moduleProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-500 dark:bg-blue-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${moduleProgress}%` }}
                />
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Модуль {vocabularyData.moduleId}
            </div>
          </div>
        </div>

        {/* Список подборок справа */}
        <div className="flex-1">
          <div className="glass-strong rounded-2xl p-8 shadow-lg">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              {vocabularyData.name}
            </h1>
            {vocabularyData.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-6">{vocabularyData.description}</p>
            )}

            <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
              Подборки модуля {vocabularyData.moduleId}:
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vocabularyData.collections.map((collection) => (
            <button
              key={collection.id}
              onClick={() => handleCollectionSelect(collection.id)}
              className="glass-card p-6 rounded-xl hover:scale-105 transition-transform text-left group"
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {collection.name}
              </h3>
              {collection.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{collection.description}</p>
              )}
            </button>
          ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModulePage;


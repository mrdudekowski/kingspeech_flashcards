/**
 * ModulePage - страница модуля
 * Отображает список подборок модуля
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/shared/hooks/redux';
import {
  selectAllWordsInModule,
  selectVocabularyData,
  setCurrentCollection,
  setCurrentCategory,
  setCurrentSubcategory,
} from '@/features/vocabulary/vocabularySlice';
import {
  resetWordsProgress,
  selectCurrentModuleProgress,
  selectCurrentModuleStats,
} from '@/features/progress/progressSlice';
import { resetWordStatusesForIds } from '@/features/flashcards/flashcardsSlice';
import { WORD_CATEGORIES, WORD_SUBCATEGORIES } from '@/app/constants';

function ModulePage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const vocabularyData = useAppSelector(selectVocabularyData);
  const moduleProgress = useAppSelector(selectCurrentModuleProgress);
  const moduleStats = useAppSelector(selectCurrentModuleStats);
  const moduleWords = useAppSelector(selectAllWordsInModule);

  const handleCollectionSelect = (collectionId: string) => {
    // Если это irregular-verbs, переходим сразу на flashcards
    if (collectionId === 'irregular-verbs') {
      dispatch(setCurrentCategory(WORD_CATEGORIES.VERBS));
      dispatch(setCurrentSubcategory(WORD_SUBCATEGORIES.IRREGULAR_VERBS));
      navigate(`/flashcards/${moduleId}/irregular-verbs`);
    } else {
      dispatch(setCurrentCollection(collectionId));
      navigate(`/module/${moduleId}/${collectionId}`);
    }
  };

  const handleResetModuleProgress = () => {
    if (!moduleWords || moduleWords.length === 0) {
      return;
    }

    if (
      !window.confirm(
        'Сбросить прогресс по всему модулю? Все отметки изучения для всех подборок и категорий будут удалены.'
      )
    ) {
      return;
    }

    const wordIds = moduleWords
      .map((word) => word.id)
      .filter((id): id is string => Boolean(id));

    if (wordIds.length === 0) {
      return;
    }

    dispatch(resetWordsProgress({ wordIds }));
    dispatch(resetWordStatusesForIds(wordIds));
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
            
            {/* Статистика модуля */}
            <div className="mt-6">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="glass rounded-lg p-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Всего слов</div>
                  <div className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    {moduleStats.total}
                  </div>
                </div>
                <div className="glass rounded-lg p-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Изучено</div>
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    {moduleStats.studied}
                  </div>
                </div>
                <div className="glass rounded-lg p-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Изучается</div>
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {moduleStats.studying}
                  </div>
                </div>
                <div className="glass rounded-lg p-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Сложные</div>
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {moduleStats.difficult}
                  </div>
                </div>
              </div>
            </div>

            {/* Кнопка "Пройти квиз" */}
            <button
              onClick={() => navigate(`/quiz/${moduleId}/setup`)}
              className="mt-6 w-full px-4 py-3 rounded-lg text-sm font-semibold transition-all bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl"
            >
              🎯 Пройти квиз
            </button>

            <button
              onClick={handleResetModuleProgress}
              disabled={!moduleWords || moduleWords.length === 0}
              className="mt-3 w-full px-4 py-2 rounded-lg text-sm font-semibold transition-colors bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Сбросить прогресс модуля
            </button>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-6">
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


/**
 * CollectionPage - страница подборки
 * Отображает категории подборки и позволяет выбрать категорию для изучения
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/shared/hooks/redux';
import {
  selectCurrentCollectionData,
  selectCurrentCollectionWords,
  setCurrentCategory,
} from '@/features/vocabulary/vocabularySlice';
import { WORD_CATEGORIES } from '@/app/constants';
import type { WordCategory } from '@/app/constants';

function CollectionPage() {
  const { moduleId, collectionId } = useParams<{ moduleId: string; collectionId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const collectionData = useAppSelector(selectCurrentCollectionData);
  const collectionWords = useAppSelector(selectCurrentCollectionWords);

  const handleCategorySelect = (category: WordCategory) => {
    dispatch(setCurrentCategory(category));
    // Переход на страницу flashcards
    if (moduleId && collectionId) {
      navigate(`/flashcards/${moduleId}/${collectionId}/${category}`);
    }
  };

  if (!collectionData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">Подборка не найдена</p>
      </div>
    );
  }

  // Подсчет слов по категориям
  const categoryCounts: Record<WordCategory, number> = {
    phrases: 0,
    verbs: 0,
    nouns: 0,
    adjectives: 0,
  };

  collectionWords.forEach((word) => {
    categoryCounts[word.category]++;
  });

  const categoryLabels: Record<WordCategory, string> = {
    phrases: 'Фразы',
    verbs: 'Глаголы',
    nouns: 'Существительные',
    adjectives: 'Прилагательные',
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass-strong rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          {collectionData.name}
        </h1>
        {collectionData.description && (
          <p className="text-gray-600 dark:text-gray-400 mb-6">{collectionData.description}</p>
        )}

        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">📊 Статистика:</p>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Всего слов в подборке: <strong>{collectionWords.length}</strong>
          </p>
        </div>

        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Выберите категорию для изучения:
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(WORD_CATEGORIES) as Array<keyof typeof WORD_CATEGORIES>).map((key) => {
            const category = WORD_CATEGORIES[key] as WordCategory;
            const count = categoryCounts[category];

            if (count === 0) return null;

            return (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className="glass-card p-6 rounded-xl hover:scale-105 transition-transform text-left group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {categoryLabels[category]}
                  </h3>
                  <span className="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full">
                    {count}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{category}</p>
              </button>
            );
          })}
        </div>

        {/* Показ слов (для тестирования) */}
        {collectionWords.length > 0 && (
          <div className="mt-8 p-4 bg-white dark:bg-slate-800 rounded-lg">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Слова в подборке ({collectionWords.length}):
            </p>
            <div className="max-h-64 overflow-y-auto scrollbar-hide space-y-2">
              {collectionWords.slice(0, 20).map((word) => (
                <div
                  key={word.id}
                  className="p-2 bg-gray-50 dark:bg-slate-700 rounded border border-gray-200 dark:border-slate-600"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{word.english}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{word.translation}</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded">
                      {word.category}
                    </span>
                  </div>
                </div>
              ))}
              {collectionWords.length > 20 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                  ... и еще {collectionWords.length - 20} слов
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CollectionPage;


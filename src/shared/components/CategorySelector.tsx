/**
 * CategorySelector - компонент для выбора категории
 */

import { useAppSelector, useAppDispatch } from '@/shared/hooks/redux';
import { selectCurrentCollectionWords, setCurrentCategory } from '@/features/vocabulary/vocabularySlice';
import { WORD_CATEGORIES } from '@/app/constants';
import type { WordCategory } from '@/app/constants';

interface CategorySelectorProps {
  currentCategory?: WordCategory | null;
}

function CategorySelector({ currentCategory }: CategorySelectorProps) {
  const dispatch = useAppDispatch();
  const collectionWords = useAppSelector(selectCurrentCollectionWords);

  // Подсчет слов по категориям
  const categoryCounts: Record<WordCategory, number> = {
    phrases: 0,
    verbs: 0,
    nouns: 0,
    adjectives: 0,
    adverbs: 0,
    pronouns: 0,
    prepositions: 0,
    conjunctions: 0,
    interjections: 0,
    articles: 0,
    numerals: 0,
    determiners: 0,
  };

  collectionWords.forEach((word) => {
    categoryCounts[word.category]++;
  });

  const categoryLabels: Record<WordCategory, string> = {
    phrases: 'Фразы',
    verbs: 'Глаголы',
    nouns: 'Существительные',
    adjectives: 'Прилагательные',
    adverbs: 'Наречия',
    pronouns: 'Местоимения',
    prepositions: 'Предлоги',
    conjunctions: 'Союзы',
    interjections: 'Междометия',
    articles: 'Артикли',
    numerals: 'Числительные',
    determiners: 'Определители',
  };

  const handleCategorySelect = (category: WordCategory) => {
    dispatch(setCurrentCategory(category));
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {(Object.keys(WORD_CATEGORIES) as Array<keyof typeof WORD_CATEGORIES>).map((key) => {
        const category = WORD_CATEGORIES[key] as WordCategory;
        const count = categoryCounts[category];

        if (count === 0) return null;

        return (
          <button
            key={category}
            onClick={() => handleCategorySelect(category)}
            className={`p-4 rounded-xl transition-all ${
              currentCategory === category
                ? 'bg-blue-500 dark:bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:scale-105'
            }`}
          >
            <div className="text-center">
              <p className="font-semibold mb-1">{categoryLabels[category]}</p>
              <p className="text-xs opacity-75 capitalize mb-2">{category}</p>
              <span className={`text-sm px-2 py-1 rounded-full ${
                currentCategory === category
                  ? 'bg-white/20 text-white'
                  : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
              }`}>
                {count} слов
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default CategorySelector;


/**
 * Quiz Setup Page
 * Страница настройки квиза перед началом
 */

import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/shared/hooks/redux';
import { createQuiz } from '@/features/quizzes/quizzesSlice';
import {
  selectAllWordsInModule,
  selectCurrentCollectionWords,
} from '@/features/vocabulary/vocabularySlice';
import { QUIZ_TYPES_ARRAY } from '@/app/constants';
import type { QuizType, WordCategory } from '@/app/constants';
import type { CreateQuizParams } from '@/features/quizzes/types';
import type { Word } from '@/shared/types';

// Получить читаемое название категории на русском
function getCategoryLabel(category: WordCategory): string {
  const labels: Record<WordCategory, string> = {
    phrases: '💬 Фразы',
    verbs: '🏃 Глаголы',
    nouns: '📦 Существительные',
    adjectives: '🎨 Прилагательные',
    adverbs: '⚡ Наречия',
    pronouns: '👤 Местоимения',
    prepositions: '🔗 Предлоги',
    conjunctions: '🔀 Союзы',
    interjections: '❗ Междометия',
    articles: '📰 Артикли',
    numerals: '🔢 Числительные',
    determiners: '☝️ Определители',
  };
  return labels[category] || category;
}

export default function QuizSetupPage() {
  const navigate = useNavigate();
  const { moduleId, collectionId } = useParams<{
    moduleId: string;
    collectionId?: string;
  }>();
  const dispatch = useAppDispatch();

  const allWords = useAppSelector(selectAllWordsInModule);
  const collectionWords = useAppSelector(selectCurrentCollectionWords);

  const [quizType, setQuizType] = useState<QuizType>('multipleChoice');
  const [selectedCategories, setSelectedCategories] = useState<Set<WordCategory>>(new Set());

  // Определяем, какие слова использовать
  const sourceWords = collectionId ? collectionWords : allWords;

  // Получаем уникальные категории из слов с подсчетом
  const categoriesInfo = useMemo(() => {
    const categoryMap = new Map<WordCategory, { count: number; label: string }>();
    
    sourceWords.forEach((word: Word) => {
      if (word.category) {
        const current = categoryMap.get(word.category) || { count: 0, label: getCategoryLabel(word.category) };
        categoryMap.set(word.category, { 
          count: current.count + 1, 
          label: current.label 
        });
      }
    });

    // Сортируем по количеству слов (по убыванию)
    return Array.from(categoryMap.entries())
      .sort((a, b) => b[1].count - a[1].count);
  }, [sourceWords]);

  // Фильтруем слова по выбранным категориям
  const words = useMemo(() => {
    if (selectedCategories.size === 0) {
      return []; // Если ничего не выбрано, возвращаем пустой массив
    }
    return sourceWords.filter((word: Word) => 
      word.category && selectedCategories.has(word.category)
    );
  }, [sourceWords, selectedCategories]);

  // Переключение категории
  const toggleCategory = (category: WordCategory) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Выбрать все категории
  const selectAllCategories = () => {
    const allCategories = new Set(categoriesInfo.map(([cat]) => cat));
    setSelectedCategories(allCategories);
  };

  // Снять выбор со всех
  const deselectAllCategories = () => {
    setSelectedCategories(new Set());
  };

  const handleStartQuiz = () => {
    if (selectedCategories.size === 0) {
      alert('Выберите хотя бы одну категорию слов для квиза');
      return;
    }
    
    if (words.length === 0) {
      alert('Нет доступных слов для квиза в выбранных категориях');
      return;
    }

    const params: CreateQuizParams = {
      type: quizType,
      moduleId: moduleId as 'A1',
      collectionId,
      settings: {
        questionCount: words.length, // Используем все доступные слова
      },
    };

    dispatch(
      createQuiz({
        params,
        words,
        allWords,
      })
    );

    navigate(`/quiz/${moduleId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="glass-strong rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Настройка квиза
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Выберите параметры перед началом
            </p>
          </div>

          {/* Quiz Type */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Тип квиза
            </label>
            <div className="grid grid-cols-2 gap-4">
              {QUIZ_TYPES_ARRAY.map((type) => (
                <button
                  key={type}
                  onClick={() => setQuizType(type)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    quizType === type
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {type === 'multipleChoice' && '📝 Выбор ответа'}
                    {type === 'trueFalse' && '✓✗ Правда/Ложь'}
                    {type === 'matching' && '🔗 Сопоставление'}
                    {type === 'fillInTheBlank' && '📄 Заполнить пропуск'}
                    {type === 'listening' && '🎧 На слух'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          {categoriesInfo.length > 0 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Категории слов
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllCategories}
                    className="text-xs px-3 py-1 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    Выбрать все
                  </button>
                  <button
                    onClick={deselectAllCategories}
                    className="text-xs px-3 py-1 rounded-md bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    Снять все
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categoriesInfo.map(([category, info]) => {
                  const isSelected = selectedCategories.has(category);
                  return (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {info.label}
                        </span>
                        {isSelected && (
                          <span className="text-green-600 dark:text-green-400">✓</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {info.count} {info.count === 1 ? 'слово' : info.count < 5 ? 'слова' : 'слов'}
                      </div>
                    </button>
                  );
                })}
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                {selectedCategories.size === 0 
                  ? '⚠️ Выберите хотя бы одну категорию для начала квиза'
                  : `✅ Выбрано категорий: ${selectedCategories.size} из ${categoriesInfo.length}`
                }
              </p>
            </div>
          )}

          {/* Info */}
          {selectedCategories.size > 0 && (
            <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-300">
                📚 Квиз будет содержать <span className="font-semibold">{words.length}</span> {words.length === 1 ? 'вопрос' : words.length < 5 ? 'вопроса' : 'вопросов'}
              </p>
              {collectionId && (
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                  Используются слова из выбранной коллекции
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg transition-colors"
            >
              Назад
            </button>
            <button
              onClick={handleStartQuiz}
              disabled={selectedCategories.size === 0 || words.length === 0}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Начать квиз
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * FlashcardDeck - компонент для управления колодой карточек
 * Управляет навигацией, прогрессом и фильтрацией
 */

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/shared/hooks/redux';
import {
  setCards,
  nextCard,
  prevCard,
  shuffleCards,
  resetFlashcards,
  selectCardIndex,
  selectTotalCards,
  selectProgress,
  selectHasNextCard,
  selectHasPrevCard,
  selectIsShuffled,
  selectDisplayMode,
  toggleDisplayMode,
  selectStudiedWordsCount,
  selectNeedsReviewWordsCount,
  selectDifficultWordsCount,
  selectIsSessionComplete,
  resetAllWordStatuses,
} from './flashcardsSlice';
import { selectCurrentSubcategoryWords } from '@/features/vocabulary/vocabularySlice';
import Flashcard from './Flashcard';
import FlashcardActions from './FlashcardActions';
import { useFlashcardHotkeys } from './useFlashcardHotkeys';

function FlashcardDeck() {
  const dispatch = useAppDispatch();
  const categoryWords = useAppSelector(selectCurrentSubcategoryWords);
  const cardIndex = useAppSelector(selectCardIndex);
  const totalCards = useAppSelector(selectTotalCards);
  const progress = useAppSelector(selectProgress);
  const hasNext = useAppSelector(selectHasNextCard);
  const hasPrev = useAppSelector(selectHasPrevCard);
  const isShuffled = useAppSelector(selectIsShuffled);
  const displayMode = useAppSelector(selectDisplayMode);
  const isEnglishFirst = displayMode === 'english-first';
  const studiedCount = useAppSelector(selectStudiedWordsCount);
  const needsReviewCount = useAppSelector(selectNeedsReviewWordsCount);
  const difficultCount = useAppSelector(selectDifficultWordsCount);
  const isSessionComplete = useAppSelector(selectIsSessionComplete);

  // Подключаем обработку горячих клавиш
  useFlashcardHotkeys();

  // Инициализация карточек при изменении слов категории
  useEffect(() => {
    if (categoryWords.length > 0) {
      dispatch(setCards(categoryWords));
    } else {
      dispatch(resetFlashcards());
    }
  }, [categoryWords, dispatch]);

  const handleNext = () => {
    dispatch(nextCard());
  };

  const handlePrev = () => {
    dispatch(prevCard());
  };

  const handleShuffle = () => {
    dispatch(shuffleCards());
  };

  const handleToggleOrder = () => {
    dispatch(toggleDisplayMode());
  };

  const handleResetProgress = () => {
    if (window.confirm('Вы уверены, что хотите сбросить весь прогресс изучения? Все отметки будут удалены.')) {
      dispatch(resetAllWordStatuses());
    }
  };

  if (categoryWords.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
            Нет слов для изучения
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Выберите категорию, чтобы начать изучение
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Заголовок и статистика */}
      <div className="mb-6 glass-strong rounded-xl p-4 shadow-lg">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Карточки для изучения</h2>
          <div className="flex flex-col md:flex-row gap-2">
            <button
              onClick={handleToggleOrder}
              className="px-4 py-2 rounded-lg font-medium transition-colors bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900/50"
            >
              Порядок: {isEnglishFirst ? 'EN → RU' : 'RU → EN'}
            </button>
            <button
              onClick={handleShuffle}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isShuffled
                  ? 'bg-green-500 dark:bg-green-600 text-white'
                  : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-green-100 dark:hover:bg-green-900/50'
              }`}
            >
              {isShuffled ? '✓ Перемешано' : 'Перемешать'}
            </button>
            {(studiedCount > 0 || needsReviewCount > 0) && (
              <button
                onClick={handleResetProgress}
                className="px-4 py-2 rounded-lg font-medium transition-colors bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-red-100 dark:hover:bg-red-900/50 relative group"
              >
                <span className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Изучать заново
                </span>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  Нажмите чтобы сбросить прогресс
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                    <div className="border-4 border-transparent border-t-gray-800 dark:border-t-gray-700"></div>
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Прогресс-бар */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Карточка {cardIndex + 1} из {totalCards}
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-blue-500 dark:bg-blue-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Статистика изучения */}
        {(studiedCount > 0 || needsReviewCount > 0 || difficultCount > 0) && (
          <div className="flex flex-wrap gap-4 mt-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-gray-600 dark:text-gray-400">
                Изучено: <span className="font-semibold text-green-600 dark:text-green-400">{studiedCount}</span>
              </span>
            </div>
            {needsReviewCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                <span className="text-gray-600 dark:text-gray-400">
                  Повторение: <span className="font-semibold text-orange-600 dark:text-orange-400">{needsReviewCount}</span>
                </span>
              </div>
            )}
            {difficultCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                <span className="text-gray-600 dark:text-gray-400">
                  Сложные: <span className="font-semibold text-purple-600 dark:text-purple-400">{difficultCount}</span>
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Сообщение о завершении сессии */}
      {isSessionComplete && (
        <div className="mb-6 glass-strong rounded-xl p-6 shadow-lg text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Поздравляем! Все карточки изучены!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Вы успешно изучили все {totalCards} карточек
          </p>
        </div>
      )}

      {/* Карточка */}
      {!isSessionComplete && (
        <div className="mb-6 relative">
          {/* Кнопка "Предыдущая" - слева */}
          <button
            onClick={handlePrev}
            disabled={!hasPrev}
            className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              hasPrev
                ? 'bg-white/80 dark:bg-slate-700/80 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-slate-700 hover:scale-110 shadow-lg border-2 border-gray-200 dark:border-slate-600'
                : 'bg-gray-200/50 dark:bg-slate-800/50 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
            }`}
            title="Предыдущая карточка"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Кнопка "Следующая" - справа */}
          <button
            onClick={handleNext}
            disabled={!hasNext}
            className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              hasNext
                ? 'bg-white/80 dark:bg-slate-700/80 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-slate-700 hover:scale-110 shadow-lg border-2 border-gray-200 dark:border-slate-600'
                : 'bg-gray-200/50 dark:bg-slate-800/50 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
            }`}
            title="Следующая карточка"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <Flashcard />
          {/* Кнопки действий */}
          <FlashcardActions />
        </div>
      )}

      {/* Счетчик карточек */}
      {!isSessionComplete && (
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {cardIndex + 1} / {totalCards}
          </p>
        </div>
      )}
    </div>
  );
}

export default FlashcardDeck;


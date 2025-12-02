/**
 * FlashcardDeck - компонент для управления колодой карточек
 * Управляет навигацией, прогрессом и фильтрацией
 */

import { useEffect, useState, useRef, useMemo, memo } from 'react';
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
  resetWordStatusesForIds,
  hydrateWordStatuses,
} from './flashcardsSlice';
import { resetWordsProgress, selectWordStatuses } from '@/features/progress/progressSlice';
import type { WordStatus } from '@/shared/types';
import { selectCurrentSubcategoryWords } from '@/features/vocabulary/vocabularySlice';
import Flashcard from './Flashcard';
import FlashcardActions from './FlashcardActions';
import { useFlashcardHotkeys } from './useFlashcardHotkeys';

function FlashcardDeck() {
  const dispatch = useAppDispatch();
  
  // Логируем вызов селектора
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 [FlashcardDeck] Вызываю selectCurrentSubcategoryWords...');
  }
  const categoryWords = useAppSelector(selectCurrentSubcategoryWords);
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ [FlashcardDeck] selectCurrentSubcategoryWords вернул:', categoryWords.length, 'слов');
  }
  const cardIndex = useAppSelector(selectCardIndex);
  const totalCards = useAppSelector(selectTotalCards);
  const cards = useAppSelector((state) => {
    const cardsFromState = state.flashcards.cards;
    if (process.env.NODE_ENV === 'development') {
      console.log('📦 [FlashcardDeck] Прямой доступ к state.flashcards.cards:', {
        length: cardsFromState.length,
        firstCard: cardsFromState[0] ? { id: cardsFromState[0].id, english: cardsFromState[0].english } : null,
      });
    }
    return cardsFromState;
  });
  
  // Диагностика: проверяем состояние cards в Redux
    useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
      console.log('📊 [FlashcardDeck] Состояние cards в Redux:', {
        cardsLength: cards.length,
        cardIndex,
        totalCards,
        currentCard: cards[cardIndex] ? { id: cards[cardIndex].id, english: cards[cardIndex].english } : null,
      });
    }, [cards, cardIndex, totalCards]);
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
  const progressWordStatuses = useAppSelector(selectWordStatuses);
  const localWordStatuses = useAppSelector((state) => state.flashcards.wordStatuses);

  // Состояние для анимации кнопки перемешать
  const [isShuffleAnimating, setIsShuffleAnimating] = useState(false);
  const [shuffleButtonText, setShuffleButtonText] = useState<'Перемешать' | 'Перемешано!'>('Перемешать');
  const shuffleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Подключаем обработку горячих клавиш
  useFlashcardHotkeys();

  // Инициализация карточек при изменении слов категории
  // Используем useMemo для мемоизации ID слов, чтобы избежать бесконечных циклов
  const categoryWordsIds = useMemo(
    () => categoryWords.map((w) => w.id).join(','),
    [categoryWords]
  );
  const prevCategoryWordsIdsRef = useRef<string>('');
  const categoryWordsRef = useRef(categoryWords);
  const cardsRef = useRef(cards);

  useEffect(() => {
    categoryWordsRef.current = categoryWords;
  }, [categoryWords]);

  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);

  useEffect(() => {
    if (categoryWords.length === 0) {
      return;
    }
    const statusesToHydrate: Record<string, WordStatus> = {};
    let hasDifferences = false;
    categoryWords.forEach((word) => {
      const statusFromProgress = progressWordStatuses[word.id];
      if (statusFromProgress && localWordStatuses[word.id] !== statusFromProgress) {
        statusesToHydrate[word.id] = statusFromProgress;
        hasDifferences = true;
      }
    });
    if (hasDifferences) {
      dispatch(hydrateWordStatuses(statusesToHydrate));
    }
  }, [categoryWords, progressWordStatuses, localWordStatuses, dispatch]);
  
  useEffect(() => {
    const latestCategoryWords = categoryWordsRef.current;
    const latestCards = cardsRef.current;

    // Проверяем, действительно ли изменились слова (по ID)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 [FlashcardDeck] useEffect проверка обновления карточек:', {
        categoryWordsCount: latestCategoryWords.length,
        cardsCount: latestCards.length,
        categoryWordsIds,
        prevCategoryWordsIds: prevCategoryWordsIdsRef.current,
        idsChanged: categoryWordsIds !== prevCategoryWordsIdsRef.current,
      });
    }
    
    // КРИТИЧНО: Обновляем cards только если categoryWords изменился И не пустой
    // Если categoryWords пустой, но cards уже есть - не сбрасываем cards!
    if (categoryWordsIds !== prevCategoryWordsIdsRef.current) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔵 [FlashcardDeck] Обновление карточек:', {
          count: latestCategoryWords.length,
          ids: categoryWordsIds,
          firstWord: latestCategoryWords[0] ? { id: latestCategoryWords[0].id, english: latestCategoryWords[0].english } : null,
          currentCardsCount: latestCards.length,
        });
      }
      
      if (latestCategoryWords.length > 0) {
        console.log('⚡ [FlashcardDeck] Вызываю dispatch(setCards) с', latestCategoryWords.length, 'словами...');
        dispatch(setCards(latestCategoryWords));
        console.log('✅ [FlashcardDeck] dispatch(setCards) выполнен');
      } else {
        // Если categoryWords пустой, но cards уже есть - не сбрасываем!
        // Это может быть race condition, когда селектор еще не обновился
        if (latestCards.length === 0) {
          console.log('⚠️ [FlashcardDeck] categoryWords пустой И cards пустой, вызываю resetFlashcards');
          dispatch(resetFlashcards());
        } else {
          console.log('⏭️ [FlashcardDeck] categoryWords пустой, но cards уже есть (' + latestCards.length + '), не сбрасываем');
        }
      }
      
      prevCategoryWordsIdsRef.current = categoryWordsIds;
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('⏭️ [FlashcardDeck] IDs не изменились, пропускаем обновление');
      }
    }
  }, [categoryWordsIds, dispatch]);

  // Сбрасываем анимацию при изменении состояния перемешивания извне
  useEffect(() => {
    if (!isShuffled && shuffleButtonText === 'Перемешано!') {
      setShuffleButtonText('Перемешать');
      setIsShuffleAnimating(false);
    }
  }, [isShuffled, shuffleButtonText]);

  // Cleanup для таймера при размонтировании компонента
  useEffect(() => {
    return () => {
      if (shuffleTimeoutRef.current) {
        clearTimeout(shuffleTimeoutRef.current);
      }
    };
  }, []);

  const handleNext = () => {
    dispatch(nextCard());
  };

  const handlePrev = () => {
    dispatch(prevCard());
  };

  const handleShuffle = () => {
    if (isShuffleAnimating) return; // Блокируем повторные нажатия
    
    // Очищаем предыдущий таймер, если он существует
    if (shuffleTimeoutRef.current) {
      clearTimeout(shuffleTimeoutRef.current);
    }
    
    setIsShuffleAnimating(true);
    setShuffleButtonText('Перемешано!');
    dispatch(shuffleCards());
    
    // Автоматически возвращаем текст обратно через 2 секунды
    shuffleTimeoutRef.current = setTimeout(() => {
      setShuffleButtonText('Перемешать');
      setIsShuffleAnimating(false);
      shuffleTimeoutRef.current = null;
    }, 2000);
  };

  const handleToggleOrder = () => {
    dispatch(toggleDisplayMode());
  };

  const handleResetProgress = () => {
    if (!categoryWords || categoryWords.length === 0) {
      return;
    }

    if (
      !window.confirm(
        'Сбросить прогресс только для текущей категории? Отметки изучения этих слов будут удалены.'
      )
    ) {
      return;
    }

    const wordIds = categoryWords
      .map((word) => word.id)
      .filter((id): id is string => Boolean(id));

    if (wordIds.length === 0) {
      return;
    }

    dispatch(resetWordsProgress({ wordIds }));
    dispatch(resetWordStatusesForIds(wordIds));
  };

  // Диагностика: логируем состояние для отладки
    useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
      console.log('🔍 [FlashcardDeck] Диагностика:', {
        categoryWordsCount: categoryWords.length,
        cardIndex,
        totalCards,
      categoryWordsSample: categoryWords.slice(0, 3).map((w) => ({
        id: w.id,
        english: w.english,
        category: w.category,
      })),
      });
    }, [categoryWords, cardIndex, totalCards]);

  // КРИТИЧНО: Проверяем cards из Redux, а не categoryWords!
  // categoryWords может быть пустым из-за race condition, но cards уже установлены через setCards
  if (cards.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ [FlashcardDeck] В Redux нет карточек для отображения!', {
        cardsLength: cards.length,
        categoryWordsLength: categoryWords.length,
      });
    }
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
            Нет слов для изучения
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Выберите категорию, чтобы начать изучение
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-left text-xs">
              <p className="font-semibold mb-2">🔍 Диагностика:</p>
              <p>cards.length: {cards.length}</p>
              <p>categoryWords.length: {categoryWords.length}</p>
              <p>totalCards: {totalCards}</p>
              <p>Проверьте логи в консоли для детальной информации</p>
            </div>
          )}
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
              disabled={isShuffleAnimating}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                isShuffleAnimating || shuffleButtonText === 'Перемешано!'
                  ? 'bg-green-500 dark:bg-green-600 text-white scale-105'
                  : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-green-100 dark:hover:bg-green-900/50'
              } ${isShuffleAnimating ? 'cursor-not-allowed opacity-90' : ''}`}
            >
              <span className="inline-block transition-all duration-300 transform">
                {shuffleButtonText}
              </span>
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
          <div className="text-6xl text-gray-800 dark:text-gray-300 mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
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

// Мемоизируем компонент, чтобы избежать лишних рендеров
export default memo(FlashcardDeck);


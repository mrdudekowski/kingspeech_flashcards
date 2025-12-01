/**
 * FlashcardActions - компонент с кнопками для отметки слов
 * Галочка (справа) - слово изучено
 * Повторение (слева) - слово требует повторения
 */

import { useAppDispatch, useAppSelector } from '@/shared/hooks/redux';
import {
  markWordStudied,
  markWordNeedsReview,
  selectCurrentCard,
  selectCurrentCardFlippedOnce,
  selectCurrentWordStatus,
  nextCard,
} from './flashcardsSlice';
import {
  markWordStudied as markWordStudiedProgress,
  setWordStatus as setWordStatusProgress,
  updateWordProgress,
} from '@/features/progress/progressSlice';
import type { WordStatus } from '@/shared/types';

function FlashcardActions() {
  const dispatch = useAppDispatch();
  const currentCard = useAppSelector(selectCurrentCard);
  const currentCardFlippedOnce = useAppSelector(selectCurrentCardFlippedOnce);
  const currentStatus = useAppSelector(selectCurrentWordStatus);
  const wordReviewCounts = useAppSelector((state) => state.flashcards.wordReviewCounts);

  // Кнопки доступны только когда карточка была перевернута хотя бы раз
  const isDisabled = !currentCardFlippedOnce || !currentCard;

  const handleMarkStudied = () => {
    if (!currentCard || isDisabled) return;
    
    // Существующий код для flashcards
    dispatch(markWordStudied(currentCard.id));
    dispatch(nextCard());
    
    // Обновляем прогресс: отмечаем слово как изученное и учитываем правильный ответ
    dispatch(markWordStudiedProgress(currentCard.id));
    dispatch(
      updateWordProgress({
        wordId: currentCard.id,
        isCorrect: true,
      })
    );
  };

  const handleMarkNeedsReview = () => {
    if (!currentCard || isDisabled) return;
    const currentCount = wordReviewCounts[currentCard.id] ?? 0;
    const newCount = currentCount + 1;
    const nextStatus: WordStatus = newCount >= 3 ? 'difficult' : 'needs-review';
    dispatch(markWordNeedsReview(currentCard.id));
    // Автоматически переходим к следующей карточке
    dispatch(nextCard());
    dispatch(
      setWordStatusProgress({
        wordId: currentCard.id,
        status: nextStatus,
      })
    );
  };

  if (!currentCard) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-6 mt-6">
      {/* Кнопка повторения (слева) */}
      <button
        onClick={handleMarkNeedsReview}
        disabled={isDisabled}
        className={`
          flex items-center justify-center
          w-16 h-16 rounded-full
          transition-all duration-300
          shadow-lg
          ${
            isDisabled
              ? 'bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : currentStatus === 'needs-review'
              ? 'bg-orange-500 dark:bg-orange-600 text-white scale-110 shadow-xl'
              : 'bg-orange-400 dark:bg-orange-500 text-white hover:bg-orange-500 dark:hover:bg-orange-600 hover:scale-110 active:scale-95'
          }
        `}
        title="Отметить как требующее повторения (← или A)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>

      {/* Подсказка с горячими клавишами */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <p className="mb-1">
          {currentCardFlippedOnce ? 'Отметьте результат' : 'Переверните карточку'}
        </p>
        {currentCardFlippedOnce && (
          <div className="flex gap-4 text-xs">
            <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded">← или A</span>
            <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded">→ или D</span>
          </div>
        )}
      </div>

      {/* Кнопка галочки (справа) */}
      <button
        onClick={handleMarkStudied}
        disabled={isDisabled}
        className={`
          flex items-center justify-center
          w-16 h-16 rounded-full
          transition-all duration-300
          shadow-lg
          ${
            isDisabled
              ? 'bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : currentStatus === 'studied'
              ? 'bg-green-500 dark:bg-green-600 text-white scale-110 shadow-xl'
              : 'bg-green-400 dark:bg-green-500 text-white hover:bg-green-500 dark:hover:bg-green-600 hover:scale-110 active:scale-95'
          }
        `}
        title="Отметить как изученное (→ или D)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </button>
    </div>
  );
}

export default FlashcardActions;


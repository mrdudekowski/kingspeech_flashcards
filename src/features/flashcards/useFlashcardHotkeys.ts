/**
 * useFlashcardHotkeys - хук для обработки горячих клавиш в flashcards
 * 
 * Поддерживаемые клавиши:
 * - ArrowLeft или A - отметить слово как требующее повторения
 * - ArrowRight или D - отметить слово как изученное
 * - Space - перевернуть карточку
 */

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/shared/hooks/redux';
import {
  markWordStudied,
  markWordNeedsReview,
  flipCard,
  nextCard,
  selectCurrentCard,
  selectCurrentCardFlippedOnce,
} from './flashcardsSlice';
import {
  markWordStudied as markWordStudiedProgress,
  setWordStatus as setWordStatusProgress,
} from '@/features/progress/progressSlice';
import type { WordStatus } from '@/shared/types';

export function useFlashcardHotkeys() {
  const dispatch = useAppDispatch();
  const currentCard = useAppSelector(selectCurrentCard);
  const currentCardFlippedOnce = useAppSelector(selectCurrentCardFlippedOnce);
  const wordReviewCounts = useAppSelector((state) => state.flashcards.wordReviewCounts);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Игнорируем, если фокус в input, textarea или других редактируемых элементах
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Игнорируем, если нажаты модификаторы (Ctrl, Alt, Meta)
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
      }

      // Переворот карточки (Space)
      if (event.key === ' ' || event.code === 'Space') {
        event.preventDefault();
        if (currentCard) {
          dispatch(flipCard());
        }
        return;
      }

      // Действия доступны только когда карточка была перевернута хотя бы раз
      if (!currentCardFlippedOnce || !currentCard) {
        return;
      }

      // Отметить как требующее повторения (ArrowLeft или A)
      if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
        event.preventDefault();
        const currentCount = wordReviewCounts[currentCard.id] ?? 0;
        const newCount = currentCount + 1;
        const nextStatus: WordStatus = newCount >= 3 ? 'difficult' : 'needs-review';
        dispatch(markWordNeedsReview(currentCard.id));
        dispatch(nextCard());
        dispatch(
          setWordStatusProgress({
            wordId: currentCard.id,
            status: nextStatus,
          })
        );
        return;
      }

      // Отметить как изученное (ArrowRight или D)
      if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
        event.preventDefault();
        dispatch(markWordStudied(currentCard.id));
        dispatch(nextCard());
        dispatch(markWordStudiedProgress(currentCard.id));
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch, currentCard, currentCardFlippedOnce, wordReviewCounts]);
}


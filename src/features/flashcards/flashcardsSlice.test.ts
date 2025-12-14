/**
 * Tests for flashcardsSlice
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import flashcardsReducer, {
  setCards,
  nextCard,
  prevCard,
  flipCard,
  shuffleCards,
  goToCard,
  resetFlashcards,
  toggleDisplayMode,
  markWordStudied,
  markWordNeedsReview,
  resetAllWordStatuses,
} from './flashcardsSlice';
import type { Word } from '@/shared/types';

// Мок данные для тестов
const mockWords: Word[] = [
  {
    id: 'word-1',
    english: 'hello',
    translation: 'привет',
    category: 'phrases',
  },
  {
    id: 'word-2',
    english: 'world',
    translation: 'мир',
    category: 'nouns',
  },
  {
    id: 'word-3',
    english: 'test',
    translation: 'тест',
    category: 'nouns',
  },
];

type TestStore = ReturnType<typeof configureStore<{ flashcards: ReturnType<typeof flashcardsReducer> }>>;

describe('flashcardsSlice', () => {
  let store: TestStore;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        flashcards: flashcardsReducer,
      },
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().flashcards;
      expect(state.cards).toEqual([]);
      expect(state.currentCardIndex).toBe(0);
      expect(state.isFlipped).toBe(false);
      expect(state.currentCardFlippedOnce).toBe(false);
      expect(state.shuffled).toBe(false);
      expect(state.displayMode).toBe('english-first');
      expect(state.wordStatuses).toEqual({});
      expect(state.reviewQueue).toEqual([]);
      expect(state.totalCardsProcessed).toBe(0);
      expect(state.isReviewingCard).toBe(false);
      expect(state.spotlightActive).toBe(false);
    });
  });

  describe('setCards', () => {
    it('should set cards and reset state', () => {
      store.dispatch(setCards(mockWords));
      const state = store.getState().flashcards;

      expect(state.cards).toHaveLength(3);
      expect(state.cards[0].id).toBe('word-1');
      expect(state.currentCardIndex).toBe(0);
      expect(state.isFlipped).toBe(false);
      expect(state.shuffled).toBe(false);
      expect(state.reviewQueue).toEqual([]);
      expect(state.totalCardsProcessed).toBe(0);
      expect(state.spotlightActive).toBe(false);
    });

    it('should initialize word statuses for new words', () => {
      store.dispatch(setCards(mockWords));
      const state = store.getState().flashcards;

      expect(state.wordStatuses['word-1']).toBe('new');
      expect(state.wordStatuses['word-2']).toBe('new');
      expect(state.wordStatuses['word-3']).toBe('new');
    });

    it('should not override existing word statuses', () => {
      // Устанавливаем карточки и помечаем одну как изученную
      store.dispatch(setCards(mockWords));
      store.dispatch(markWordStudied('word-1'));

      // Устанавливаем карточки снова
      store.dispatch(setCards(mockWords));
      const state = store.getState().flashcards;

      // Статус изученной карточки должен сохраниться
      expect(state.wordStatuses['word-1']).toBe('studied');
    });
  });

  describe('nextCard', () => {
    beforeEach(() => {
      store.dispatch(setCards(mockWords));
    });

    it('should move to next unstudied card', () => {
      store.dispatch(nextCard());
      const state = store.getState().flashcards;
      expect(state.currentCardIndex).toBe(1);
      expect(state.totalCardsProcessed).toBe(1);
      expect(state.isFlipped).toBe(false);
      expect(state.spotlightActive).toBe(false);
    });

    it('should skip studied cards', () => {
      store.dispatch(markWordStudied('word-2'));
      store.dispatch(nextCard());

      const state = store.getState().flashcards;
      // Должна перескочить word-2 (изученную) и перейти к word-3
      expect(state.currentCardIndex).toBe(2);
    });

    it('should stay at current card when all cards are studied', () => {
      // Помечаем все карточки как изученные
      mockWords.forEach(word => store.dispatch(markWordStudied(word.id)));
      
      const initialIndex = store.getState().flashcards.currentCardIndex;
      store.dispatch(nextCard());
      
      const state = store.getState().flashcards;
      expect(state.currentCardIndex).toBe(initialIndex);
    });
  });

  describe('prevCard', () => {
    beforeEach(() => {
      store.dispatch(setCards(mockWords));
    });

    it('should move to previous card', () => {
      // Переходим вперед
      store.dispatch(nextCard());
      store.dispatch(nextCard());
      
      // Возвращаемся назад
      store.dispatch(prevCard());
      
      const state = store.getState().flashcards;
      expect(state.currentCardIndex).toBe(1);
      expect(state.isFlipped).toBe(false);
      expect(state.spotlightActive).toBe(false);
    });

    it('should not go below index 0', () => {
      store.dispatch(prevCard());
      const state = store.getState().flashcards;
      expect(state.currentCardIndex).toBe(0);
    });
  });

  describe('flipCard', () => {
    beforeEach(() => {
      store.dispatch(setCards(mockWords));
    });

    it('should flip card', () => {
      store.dispatch(flipCard());
      let state = store.getState().flashcards;
      expect(state.isFlipped).toBe(true);
      expect(state.currentCardFlippedOnce).toBe(true);
      expect(state.spotlightActive).toBe(false);

      // Flip обратно
      store.dispatch(flipCard());
      state = store.getState().flashcards;
      expect(state.isFlipped).toBe(false);
      expect(state.currentCardFlippedOnce).toBe(true); // Должен остаться true
    });
  });

  describe('shuffleCards', () => {
    beforeEach(() => {
      store.dispatch(setCards(mockWords));
    });

    it('should shuffle cards and reset state', () => {
      // Переходим на вторую карточку
      store.dispatch(nextCard());
      
      // Перемешиваем
      store.dispatch(shuffleCards());
      
      const state = store.getState().flashcards;
      expect(state.cards).toHaveLength(3); // Количество не изменилось
      expect(state.currentCardIndex).toBe(0); // Сброс на первую
      expect(state.isFlipped).toBe(false);
      expect(state.shuffled).toBe(true);
      expect(state.reviewQueue).toEqual([]);
      expect(state.totalCardsProcessed).toBe(0);
    });
  });

  describe('goToCard', () => {
    beforeEach(() => {
      store.dispatch(setCards(mockWords));
    });

    it('should go to specific card by index', () => {
      store.dispatch(goToCard(2));
      const state = store.getState().flashcards;
      expect(state.currentCardIndex).toBe(2);
      expect(state.isFlipped).toBe(false);
      expect(state.currentCardFlippedOnce).toBe(false);
    });

    it('should ignore invalid indices', () => {
      store.dispatch(goToCard(999));
      let state = store.getState().flashcards;
      expect(state.currentCardIndex).toBe(0);

      store.dispatch(goToCard(-1));
      state = store.getState().flashcards;
      expect(state.currentCardIndex).toBe(0);
    });
  });

  describe('toggleDisplayMode', () => {
    it('should toggle between english-first and translation-first', () => {
      store.dispatch(toggleDisplayMode());
      let state = store.getState().flashcards;
      expect(state.displayMode).toBe('translation-first');
      expect(state.isFlipped).toBe(false);

      store.dispatch(toggleDisplayMode());
      state = store.getState().flashcards;
      expect(state.displayMode).toBe('english-first');
    });
  });

  describe('markWordStudied', () => {
    beforeEach(() => {
      store.dispatch(setCards(mockWords));
    });

    it('should mark word as studied', () => {
      store.dispatch(markWordStudied('word-1'));
      const state = store.getState().flashcards;
      expect(state.wordStatuses['word-1']).toBe('studied');
    });

    it('should remove word from review queue', () => {
      // Добавляем слово в очередь повторения
      store.dispatch(markWordNeedsReview('word-1'));
      expect(store.getState().flashcards.reviewQueue).toHaveLength(1);

      // Помечаем как изученное
      store.dispatch(markWordStudied('word-1'));
      const state = store.getState().flashcards;
      expect(state.reviewQueue).toHaveLength(0);
    });
  });

  describe('markWordNeedsReview', () => {
    beforeEach(() => {
      store.dispatch(setCards(mockWords));
    });

    it('should mark word as needs-review', () => {
      store.dispatch(markWordNeedsReview('word-1'));
      const state = store.getState().flashcards;
      expect(state.wordStatuses['word-1']).toBe('needs-review');
      expect(state.reviewQueue).toHaveLength(1);
    });

    it('should mark as difficult after 3 reviews', () => {
      store.dispatch(markWordNeedsReview('word-1'));
      store.dispatch(markWordNeedsReview('word-1'));
      store.dispatch(markWordNeedsReview('word-1'));
      
      const state = store.getState().flashcards;
      expect(state.wordStatuses['word-1']).toBe('difficult');
    });
  });

  describe('resetAllWordStatuses', () => {
    beforeEach(() => {
      store.dispatch(setCards(mockWords));
    });

    it('should reset all word statuses to new', () => {
      // Помечаем слова разными статусами
      store.dispatch(markWordStudied('word-1'));
      store.dispatch(markWordNeedsReview('word-2'));

      // Сбрасываем все
      store.dispatch(resetAllWordStatuses());

      const state = store.getState().flashcards;
      expect(state.wordStatuses['word-1']).toBe('new');
      expect(state.wordStatuses['word-2']).toBe('new');
      expect(state.wordStatuses['word-3']).toBe('new');
      expect(state.reviewQueue).toEqual([]);
      expect(state.totalCardsProcessed).toBe(0);
      expect(state.currentCardIndex).toBe(0);
      expect(state.isFlipped).toBe(false);
    });
  });

  describe('resetFlashcards', () => {
    it('should reset to initial state', () => {
      // Устанавливаем значения
      store.dispatch(setCards(mockWords));
      store.dispatch(nextCard());
      store.dispatch(flipCard());
      store.dispatch(markWordStudied('word-1'));

      // Сбрасываем
      store.dispatch(resetFlashcards());

      const state = store.getState().flashcards;
      expect(state.cards).toEqual([]);
      expect(state.currentCardIndex).toBe(0);
      expect(state.isFlipped).toBe(false);
      expect(state.shuffled).toBe(false);
      expect(state.wordStatuses).toEqual({});
      expect(state.reviewQueue).toEqual([]);
      expect(state.spotlightActive).toBe(false);
    });
  });
});

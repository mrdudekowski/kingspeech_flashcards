/**
 * Flashcards Slice - управление состоянием карточек для изучения
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';
import type { Word } from '@/shared/types';
import type { FlashcardsState, FlashcardDisplayMode, WordStatus, ReviewQueueItem } from './types';

const initialState: FlashcardsState = {
  cards: [],
  currentCardIndex: 0,
  isFlipped: false,
  currentCardFlippedOnce: false,
  shuffled: false,
  displayMode: 'english-first',
  wordStatuses: {},
  reviewQueue: [],
  totalCardsProcessed: 0,
  reviewInterval: { min: 3, max: 6 },
  isReviewingCard: false,
  difficultWordsGuessedOnce: {},
  wordReviewCounts: {},
  newCardsSinceLastReview: 0,
  newCardsBeforeReview: 2, // Показывать 2 новые карточки, затем 1 повторение
};

const flashcardsSlice = createSlice({
  name: 'flashcards',
  initialState,
  reducers: {
    // Установка карточек
    setCards: (state, action: PayloadAction<Word[]>) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🎴 [flashcardsSlice] setCards вызван с', action.payload.length, 'карточками');
      }
      state.cards = action.payload;
      state.currentCardIndex = 0;
      state.isFlipped = false;
      state.currentCardFlippedOnce = false;
      state.shuffled = false;
      state.reviewQueue = [];
      state.totalCardsProcessed = 0;
      state.isReviewingCard = false;
      state.newCardsSinceLastReview = 0;
      // Инициализируем статусы для новых слов (только если их еще нет)
      action.payload.forEach((word) => {
        if (!(word.id in state.wordStatuses)) {
          state.wordStatuses[word.id] = 'new';
        }
      });
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [flashcardsSlice] setCards завершен. cards.length:', state.cards.length);
      }
    },

    // Переход к следующей карточке
    nextCard: (state) => {
      state.totalCardsProcessed += 1;
      state.isFlipped = false;
      state.currentCardFlippedOnce = false;

      // Проверяем очередь повторений: есть ли карточки, готовые к показу?
      const readyForReview = state.reviewQueue.filter(
        (item) => item.scheduledForCardIndex <= state.totalCardsProcessed
      );

      // Решаем: показывать повторение или новую карточку?
      // Показываем повторение, если:
      // 1. Есть готовые карточки для повторения
      // 2. И прошло достаточно новых карточек (newCardsSinceLastReview >= newCardsBeforeReview)
      const shouldShowReview = readyForReview.length > 0 && 
                               state.newCardsSinceLastReview >= state.newCardsBeforeReview;

      if (shouldShowReview) {
        // Берем первую карточку из очереди
        const reviewItem = readyForReview[0];
        // Удаляем её из очереди
        state.reviewQueue = state.reviewQueue.filter((item) => item.wordId !== reviewItem.wordId);
        
        // Находим индекс карточки в массиве cards
        const cardIndex = state.cards.findIndex((card) => card.id === reviewItem.wordId);
        if (cardIndex !== -1) {
          state.currentCardIndex = cardIndex;
          state.isReviewingCard = true;
          state.newCardsSinceLastReview = 0; // Сбрасываем счетчик после показа повторения
          return;
        }
      }

      // Если нет карточек для повторения или еще не время, переходим к следующей новой карточке
      state.isReviewingCard = false;
      state.newCardsSinceLastReview += 1; // Увеличиваем счетчик новых карточек
      
      // Находим следующую не изученную карточку
      // Начинаем поиск с currentCardIndex + 1, если дошли до конца - ищем с начала
      let nextIndex = state.currentCardIndex + 1;
      
      // Ищем с текущей позиции до конца
      while (nextIndex < state.cards.length) {
        const card = state.cards[nextIndex];
        const status = state.wordStatuses[card.id] || 'new';
        if (status !== 'studied') {
          state.currentCardIndex = nextIndex;
          return;
        }
        nextIndex += 1;
      }

      // Если не нашли, ищем с начала до текущей позиции
      nextIndex = 0;
      while (nextIndex <= state.currentCardIndex) {
        const card = state.cards[nextIndex];
        const status = state.wordStatuses[card.id] || 'new';
        if (status !== 'studied') {
          state.currentCardIndex = nextIndex;
          return;
        }
        nextIndex += 1;
      }

      // Если все карточки изучены, но есть очередь повторений - ждем
      if (state.reviewQueue.length > 0) {
        // Остаемся на текущей карточке, но увеличили totalCardsProcessed
        // Следующий вызов nextCard покажет карточку из очереди
        return;
      }

      // Если все изучено и очереди нет - остаемся на текущей карточке
    },

    // Переход к предыдущей карточке
    prevCard: (state) => {
      if (state.currentCardIndex > 0) {
        state.currentCardIndex -= 1;
        state.isFlipped = false; // Сбрасываем переворот при переходе
        // Не сбрасываем currentCardFlippedOnce, так как пользователь может вернуться к уже перевернутой карточке
        // Но если карточка еще не была перевернута, флаг останется false
      }
    },

    // Переворот карточки
    flipCard: (state) => {
      state.isFlipped = !state.isFlipped;
      // Отмечаем, что карточка была перевернута хотя бы раз
      if (!state.currentCardFlippedOnce) {
        state.currentCardFlippedOnce = true;
      }
    },

    // Перемешивание карточек
    shuffleCards: (state) => {
      // Создаем копию массива для перемешивания
      const shuffled = [...state.cards];
      
      // Алгоритм Fisher-Yates для перемешивания
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      state.cards = shuffled;
      state.currentCardIndex = 0;
      state.isFlipped = false;
      state.currentCardFlippedOnce = false;
      state.shuffled = true;
      // Очищаем очередь повторений при перемешивании
      state.reviewQueue = [];
      state.totalCardsProcessed = 0;
      state.isReviewingCard = false;
      state.difficultWordsGuessedOnce = {};
      state.wordReviewCounts = {};
      state.newCardsSinceLastReview = 0;
    },

    // Переход к конкретной карточке по индексу
    goToCard: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      if (index >= 0 && index < state.cards.length) {
        state.currentCardIndex = index;
        state.isFlipped = false;
        state.currentCardFlippedOnce = false; // Сбрасываем флаг для новой карточки
      }
    },

    // Сброс состояния
    resetFlashcards: (state) => {
      state.cards = [];
      state.currentCardIndex = 0;
      state.isFlipped = false;
      state.currentCardFlippedOnce = false;
      state.shuffled = false;
      state.wordStatuses = {};
      state.reviewQueue = [];
      state.totalCardsProcessed = 0;
      state.isReviewingCard = false;
      state.difficultWordsGuessedOnce = {};
      state.wordReviewCounts = {};
      state.newCardsSinceLastReview = 0;
    },

    // Переключение порядка отображения сторон карточки
    toggleDisplayMode: (state) => {
      state.displayMode =
        state.displayMode === 'english-first' ? 'translation-first' : 'english-first';
      state.isFlipped = false;
      // Не сбрасываем currentCardFlippedOnce, так как карточка уже была перевернута
    },

    setDisplayMode: (state, action: PayloadAction<FlashcardDisplayMode>) => {
      state.displayMode = action.payload;
      state.isFlipped = false;
      // Не сбрасываем currentCardFlippedOnce, так как карточка уже была перевернута
    },

    // Отметить слово как изученное
    markWordStudied: (state, action: PayloadAction<string>) => {
      const wordId = action.payload;
      if (state.cards.some((card) => card.id === wordId)) {
        const currentStatus = state.wordStatuses[wordId] || 'new';
        
        // Если слово было "difficult"
        if (currentStatus === 'difficult') {
          // Проверяем, было ли оно уже отгадано один раз
          if (state.difficultWordsGuessedOnce[wordId]) {
            // Второе угадывание - переводим в "studied"
            state.wordStatuses[wordId] = 'studied';
            // Удаляем из отслеживания
            delete state.difficultWordsGuessedOnce[wordId];
            // Сбрасываем счетчик повторений, так как слово изучено
            delete state.wordReviewCounts[wordId];
          } else {
            // Первое угадывание - сбрасываем статус на "needs-review"
            state.wordStatuses[wordId] = 'needs-review';
            // Отмечаем, что было отгадано один раз
            state.difficultWordsGuessedOnce[wordId] = true;
            // Счетчик повторений НЕ сбрасываем, так как слово еще не полностью изучено
          }
        } else {
          // Обычная логика - сразу "studied"
          state.wordStatuses[wordId] = 'studied';
          // Удаляем из отслеживания, если было там
          delete state.difficultWordsGuessedOnce[wordId];
          // Сбрасываем счетчик повторений, так как слово изучено
          delete state.wordReviewCounts[wordId];
        }
        
        // Удаляем из очереди повторений, если там есть
        state.reviewQueue = state.reviewQueue.filter((item) => item.wordId !== wordId);
      }
    },

    // Отметить слово как требующее повторения
    markWordNeedsReview: (state, action: PayloadAction<string>) => {
      const wordId = action.payload;
      if (state.cards.some((card) => card.id === wordId)) {
        // Увеличиваем счетчик повторений (используем постоянное хранилище)
        const currentReviewCount = state.wordReviewCounts[wordId] || 0;
        const newReviewCount = currentReviewCount + 1;
        state.wordReviewCounts[wordId] = newReviewCount;

        // Если карточка отмечена для повторения 3+ раза, она становится "сложным словом"
        if (newReviewCount >= 3) {
          state.wordStatuses[wordId] = 'difficult';
          // Сбрасываем флаг отгадывания, если был
          delete state.difficultWordsGuessedOnce[wordId];
        } else {
          state.wordStatuses[wordId] = 'needs-review';
        }

        // Удаляем старую запись из очереди, если она есть
        state.reviewQueue = state.reviewQueue.filter((item) => item.wordId !== wordId);

        // Вычисляем когда показать карточку для повторения (через 3-6 карточек)
        const interval = Math.floor(
          Math.random() * (state.reviewInterval.max - state.reviewInterval.min + 1) +
            state.reviewInterval.min
        );
        const scheduledForCardIndex = state.totalCardsProcessed + interval;

        // Добавляем в очередь с актуальным reviewCount
        const reviewItem: ReviewQueueItem = {
          wordId,
          markedAtCardIndex: state.totalCardsProcessed,
          scheduledForCardIndex,
          reviewCount: newReviewCount,
        };

        state.reviewQueue.push(reviewItem);
        // Сортируем очередь по scheduledForCardIndex
        state.reviewQueue.sort((a, b) => a.scheduledForCardIndex - b.scheduledForCardIndex);
      }
    },

    // Сбросить статус слова
    resetWordStatus: (state, action: PayloadAction<string>) => {
      const wordId = action.payload;
      if (wordId in state.wordStatuses) {
        state.wordStatuses[wordId] = 'new';
      }
    },

    // Сбросить все статусы
    resetAllWordStatuses: (state) => {
      state.wordStatuses = {};
      state.reviewQueue = [];
      state.totalCardsProcessed = 0;
      state.isReviewingCard = false;
      state.currentCardIndex = 0; // Сбрасываем на первую карточку
      state.isFlipped = false; // Сбрасываем переворот
      state.currentCardFlippedOnce = false; // Сбрасываем флаг переворота
      state.difficultWordsGuessedOnce = {}; // Сбрасываем отслеживание difficult слов
      state.wordReviewCounts = {}; // Сбрасываем счетчики повторений
      state.newCardsSinceLastReview = 0; // Сбрасываем счетчик новых карточек
      // Инициализируем все слова как новые
      state.cards.forEach((word) => {
        state.wordStatuses[word.id] = 'new';
      });
    },

    hydrateWordStatuses: (state, action: PayloadAction<Record<string, WordStatus>>) => {
      const incoming = action.payload;
      Object.entries(incoming).forEach(([wordId, status]) => {
        state.wordStatuses[wordId] = status;
      });
    },
  },
});

// ============================================
// Actions
// ============================================
export const {
  setCards,
  nextCard,
  prevCard,
  flipCard,
  shuffleCards,
  goToCard,
  resetFlashcards,
  toggleDisplayMode,
  setDisplayMode,
  markWordStudied,
  markWordNeedsReview,
  resetWordStatus,
  resetAllWordStatuses,
  hydrateWordStatuses,
} = flashcardsSlice.actions;

// ============================================
// Селекторы
// ============================================

// Текущая карточка
export const selectCurrentCard = (state: RootState): Word | null => {
  const { cards, currentCardIndex } = state.flashcards;
  return cards.length > 0 && currentCardIndex < cards.length
    ? cards[currentCardIndex]
    : null;
};

// Состояние переворота
export const selectIsFlipped = (state: RootState): boolean => {
  return state.flashcards.isFlipped;
};

// Была ли текущая карточка перевернута хотя бы раз
export const selectCurrentCardFlippedOnce = (state: RootState): boolean => {
  return state.flashcards.currentCardFlippedOnce;
};

// Индекс текущей карточки
export const selectCardIndex = (state: RootState): number => {
  return state.flashcards.currentCardIndex;
};

// Общее количество карточек
export const selectTotalCards = (state: RootState): number => {
  const length = state.flashcards.cards.length;
  if (process.env.NODE_ENV === 'development') {
    console.log('🔢 [selectTotalCards] Вызван, возвращаю:', length, 'cards:', state.flashcards.cards.slice(0, 2).map(c => c?.id));
  }
  return length;
};

// Прогресс изучения (процент) - с учетом повторений
export const selectProgress = (state: RootState): number => {
  const { cards, wordStatuses } = state.flashcards;
  if (cards.length === 0) return 0;
  const studiedCount = cards.filter((card) => wordStatuses[card.id] === 'studied').length;
  return Math.round((studiedCount / cards.length) * 100);
};

// Есть ли следующая карточка (новая или для повторения)
export const selectHasNextCard = (state: RootState): boolean => {
  const { cards, currentCardIndex, reviewQueue, wordStatuses, totalCardsProcessed } =
    state.flashcards;

  // Проверяем, есть ли карточки для повторения, готовые к показу
  const readyForReview = reviewQueue.filter(
    (item) => item.scheduledForCardIndex <= totalCardsProcessed + 1
  );
  if (readyForReview.length > 0) {
    return true;
  }

  // Проверяем, есть ли не изученные карточки
  for (let i = currentCardIndex + 1; i < cards.length; i++) {
    const card = cards[i];
    const status = wordStatuses[card.id] || 'new';
    if (status !== 'studied') {
      return true;
    }
  }

  // Если есть карточки в очереди (но еще не готовы) - есть следующая
  if (reviewQueue.length > 0) {
    return true;
  }

  return false;
};

// Есть ли предыдущая карточка
export const selectHasPrevCard = (state: RootState): boolean => {
  return state.flashcards.currentCardIndex > 0;
};

// Перемешаны ли карточки
export const selectIsShuffled = (state: RootState): boolean => {
  return state.flashcards.shuffled;
};

// Порядок отображения сторон
export const selectDisplayMode = (state: RootState): FlashcardDisplayMode => {
  return state.flashcards.displayMode;
};

// Статус конкретного слова
export const selectWordStatus = (state: RootState, wordId: string): WordStatus => {
  return state.flashcards.wordStatuses[wordId] || 'new';
};

// Статус текущей карточки
export const selectCurrentWordStatus = (state: RootState): WordStatus => {
  const currentCard = selectCurrentCard(state);
  if (!currentCard) return 'new';
  return state.flashcards.wordStatuses[currentCard.id] || 'new';
};

// Количество изученных слов
export const selectStudiedWordsCount = (state: RootState): number => {
  const { cards, wordStatuses } = state.flashcards;
  return cards.filter((card) => wordStatuses[card.id] === 'studied').length;
};

// Количество слов, требующих повторения (включая сложные)
export const selectNeedsReviewWordsCount = (state: RootState): number => {
  const { cards, wordStatuses } = state.flashcards;
  return cards.filter((card) => {
    const status = wordStatuses[card.id];
    return status === 'needs-review' || status === 'difficult';
  }).length;
};

// Количество сложных слов
export const selectDifficultWordsCount = (state: RootState): number => {
  const { cards, wordStatuses } = state.flashcards;
  return cards.filter((card) => wordStatuses[card.id] === 'difficult').length;
};

// Текущая карточка из очереди повторения?
export const selectIsReviewingCard = (state: RootState): boolean => {
  return state.flashcards.isReviewingCard;
};

// Сессия завершена? (все карточки изучены и очередь пуста)
export const selectIsSessionComplete = (state: RootState): boolean => {
  const { cards, wordStatuses, reviewQueue } = state.flashcards;
  if (cards.length === 0) return false;

  // Проверяем, все ли карточки изучены
  const allStudied = cards.every((card) => {
    const status = wordStatuses[card.id] || 'new';
    return status === 'studied';
  });

  // И очередь повторений пуста
  return allStudied && reviewQueue.length === 0;
};

// Количество карточек в очереди повторения
export const selectReviewQueueLength = (state: RootState): number => {
  return state.flashcards.reviewQueue.length;
};

// ============================================
// Reducer
// ============================================
export default flashcardsSlice.reducer;


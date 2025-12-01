/**
 * Типы для модуля flashcards
 */

import type { Word, WordStatus as SharedWordStatus } from '@/shared/types';

export type WordStatus = SharedWordStatus;

/**
 * Состояние flashcards
 */
export type FlashcardDisplayMode = 'english-first' | 'translation-first';

/**
 * Элемент очереди для повторения карточки
 */
export interface ReviewQueueItem {
  wordId: string; // ID слова для повторения
  markedAtCardIndex: number; // Индекс карточки, когда была отмечена как "нужно повторить"
  scheduledForCardIndex: number; // Индекс карточки, когда должна появиться (markedAtCardIndex + random(3-6))
  reviewCount: number; // Количество раз, когда карточка была отмечена для повторения
}

export interface FlashcardsState {
  cards: Word[]; // Массив карточек (слов)
  currentCardIndex: number; // Индекс текущей карточки
  isFlipped: boolean; // Перевернута ли текущая карточка
  currentCardFlippedOnce: boolean; // Была ли текущая карточка перевернута хотя бы раз
  shuffled: boolean; // Перемешаны ли карточки
  displayMode: FlashcardDisplayMode; // Порядок отображения сторон карточки
  wordStatuses: Record<string, WordStatus>; // Статусы слов по ID
  reviewQueue: ReviewQueueItem[]; // Очередь карточек для повторения
  totalCardsProcessed: number; // Общее количество обработанных карточек (для отслеживания прогресса)
  reviewInterval: { min: number; max: number }; // Интервал повторения (по умолчанию 3-6)
  isReviewingCard: boolean; // Флаг, что текущая карточка из очереди повторения
  difficultWordsGuessedOnce: Record<string, boolean>; // Слова, которые были difficult и отгаданы один раз
  wordReviewCounts: Record<string, number>; // Количество раз, когда каждое слово было отмечено для повторения
  newCardsSinceLastReview: number; // Счетчик новых карточек с последнего повторения
  newCardsBeforeReview: number; // Сколько новых карточек показывать перед повторением (по умолчанию 2)
}


/**
 * Общие типы приложения.
 * ВНИМАНИЕ: этот файл шарится между основным веб-приложением и WORDSMITH.
 * Поэтому избегаем жёстких импортов типов, которые могут отсутствовать
 * в разных сборках (например, QuizType, TagId и т.п.).
 */

import type { ModuleId, WordCategory } from '@/app/constants';

// TagId определяется только в среде основного приложения; для WORDSMITH
// типизированное поле tags здесь оставляем как string[], чтобы избежать
// жёсткой связки по импорту типов.

// ============================================
// Типы для словаря
// ============================================

/**
 * Три формы неправильного глагола
 */
export interface IrregularVerbForms {
  past: string; // Вторая форма (Past Simple), например "was/were"
  pastParticiple: string; // Третья форма (Past Participle), например "been"
}

/**
 * Слово или фраза с переводом/определением
 */
export interface Word {
  id: string;
  english: string; // Английское слово/фраза
  translation: string; // Перевод на русский
  definition?: string; // Определение на английском (опционально)
  example?: string; // Пример использования (опционально)
  category: WordCategory; // Основная категория: phrases, verbs, nouns, adjectives, adverbs, pronouns, prepositions, conjunctions, interjections, articles, numerals, determiners
  subcategory?: string; // Подкатегория для более тонкой классификации (опционально)
  tags?: string[]; // Семантические теги (topic/register/function/difficulty)
  irregularForms?: IrregularVerbForms; // Три формы неправильного глагола (опционально, только для irregularVerbs)
}

/**
 * Статус изучения слова
 */
export type WordStatus = 'new' | 'studied' | 'needs-review' | 'difficult';

/**
 * Категория слов внутри подборки
 */
export interface CategoryData {
  [key: string]: Word[]; // Ключ - категория (phrases, verbs, etc.), значение - массив слов
}

/**
 * Подборка слов (тематическая группа)
 * Может быть определена либо через поле file (ссылка на отдельный файл),
 * либо через поле categories (встроенные данные)
 */
export interface Collection {
  id: string; // travelling, food, work, etc.
  name: string; // Travelling, Food, Work, etc.
  description?: string; // Описание подборки
  file?: string; // Путь к файлу коллекции относительно папки модуля (например, './collections/basic-verbs.json')
  categories?: CategoryData; // Категории с словами (опционально, если используется file)
}

/**
 * Модуль словаря (A1, A2, B1, etc.)
 */
export interface VocabularyModule {
  moduleId: ModuleId; // A1, A2, B1, etc. (из constants)
  name: string; // Название модуля
  description?: string; // Описание модуля
  collections: Collection[]; // Подборки внутри модуля
}

// ============================================
// Типы для прогресса
// ============================================

/**
 * Прогресс изучения одного слова
 */
export interface WordProgress {
  wordId: string;
  studiedAt: string; // ISO дата
  correctAnswers: number;
  incorrectAnswers: number;
  lastReviewedAt?: string; // ISO дата последнего повторения
  masteryLevel: number; // 0-5 уровень освоения
}

/**
 * Результат квиза.
 *
 * Внимание: тип quizType не жёстко связан с QUIZ_TYPES из constants.ts,
 * чтобы этот файл можно было переиспользовать в разных окружениях
 * (основное приложение, WORDSMITH и т.п.).
 */
export interface QuizResult {
  quizId: string;
  quizType: string;
  moduleId: ModuleId;
  collectionId?: string;
  category?: WordCategory;
  completedAt: string; // ISO дата
  score: number; // Процент правильных ответов (0-100)
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // Время в секундах
  mistakes: string[]; // ID слов, в которых были ошибки
}

/**
 * Общая статистика прогресса
 */
export interface ProgressStatistics {
  totalWordsStudied: number;
  totalQuizzesCompleted: number;
  averageScore: number;
  studyStreak: number; // Дней подряд
  lastStudyDate?: string; // ISO дата
}

// ============================================
// Типы для состояния Redux
// ============================================

/**
 * Состояние загрузки
 */
export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

/**
 * Базовый интерфейс для состояния с загрузкой
 */
export interface AsyncState {
  loading: LoadingState;
  error: string | null;
}

/**
 * Quiz Types
 * Типы для системы квизов
 */

import type { Word } from '@/shared/types';
import type { QuizType, ModuleId, WordCategory, WordSubcategory } from '@/app/constants';

/**
 * Один вопрос в квизе
 */
export interface QuizQuestion {
  id: string;
  word: Word;
  correctAnswer: string;
  options?: string[]; // Для multipleChoice
  userAnswer?: string;
  isCorrect?: boolean;
  answeredAt?: string;
}

/**
 * Настройки квиза
 */
export interface QuizSettings {
  questionCount: number; // Количество вопросов
  timeLimit?: number; // Лимит времени в секундах (опционально)
  shuffleQuestions: boolean; // Перемешивать вопросы
  shuffleOptions: boolean; // Перемешивать варианты ответов
  showCorrectAnswer: boolean; // Показывать правильный ответ после ошибки
  allowRetry: boolean; // Разрешить повторное прохождение
}

/**
 * Активный квиз
 */
export interface Quiz {
  id: string;
  type: QuizType;
  moduleId: ModuleId;
  collectionId?: string;
  category?: WordCategory;
  subcategory?: WordSubcategory;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  settings: QuizSettings;
  startTime: string;
  endTime?: string;
  timeSpent?: number; // В секундах
  isCompleted: boolean;
  isPaused: boolean;
}

/**
 * Статистика по квизу
 */
export interface QuizStats {
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  accuracy: number; // Процент правильных ответов
  averageTimePerQuestion?: number; // Среднее время на вопрос
}

/**
 * Состояние квизов
 */
export interface QuizzesState {
  currentQuiz: Quiz | null;
  isActive: boolean;
  history: string[]; // IDs завершенных квизов
  stats: QuizStats | null;
  error: string | null;
}

/**
 * Параметры для создания квиза
 */
export interface CreateQuizParams {
  type: QuizType;
  moduleId: ModuleId;
  collectionId?: string;
  category?: WordCategory;
  subcategory?: WordSubcategory;
  settings?: Partial<QuizSettings>;
}

/**
 * Результат ответа на вопрос
 */
export interface AnswerResult {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  word: Word;
}

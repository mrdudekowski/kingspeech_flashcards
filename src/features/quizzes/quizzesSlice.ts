/**
 * Quizzes Slice
 * Redux slice для управления квизами
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';
import type {
  QuizzesState,
  Quiz,
  QuizStats,
  CreateQuizParams,
  QuizSettings,
} from './types';
import { generateQuestions } from './utils/quizGenerator';
import type { Word } from '@/shared/types';
import { log } from '@/shared/utils';

/**
 * Настройки квиза по умолчанию
 */
const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
  questionCount: 20,
  timeLimit: undefined,
  shuffleQuestions: true,
  shuffleOptions: true,
  showCorrectAnswer: true,
  allowRetry: true,
};

/**
 * Начальное состояние
 */
const initialState: QuizzesState = {
  currentQuiz: null,
  isActive: false,
  history: [],
  stats: null,
  error: null,
};

/**
 * Вычислить статистику квиза
 */
function calculateStats(quiz: Quiz): QuizStats {
  const answeredQuestions = quiz.questions.filter((q) => q.userAnswer !== undefined);
  const correctAnswers = answeredQuestions.filter((q) => q.isCorrect === true);
  const incorrectAnswers = answeredQuestions.filter((q) => q.isCorrect === false);
  const skippedQuestions = quiz.questions.filter((q) => q.userAnswer === undefined);

  const accuracy =
    answeredQuestions.length > 0
      ? Math.round((correctAnswers.length / answeredQuestions.length) * 100)
      : 0;

  let averageTimePerQuestion: number | undefined;
  if (quiz.timeSpent && answeredQuestions.length > 0) {
    averageTimePerQuestion = Math.round(quiz.timeSpent / answeredQuestions.length);
  }

  return {
    totalQuestions: quiz.questions.length,
    answeredQuestions: answeredQuestions.length,
    correctAnswers: correctAnswers.length,
    incorrectAnswers: incorrectAnswers.length,
    skippedQuestions: skippedQuestions.length,
    accuracy,
    averageTimePerQuestion,
  };
}

/**
 * Quizzes Slice
 */
const quizzesSlice = createSlice({
  name: 'quizzes',
  initialState,
  reducers: {
    /**
     * Создать новый квиз
     */
    createQuiz: (
      state,
      action: PayloadAction<{
        params: CreateQuizParams;
        words: Word[];
        allWords: Word[];
      }>
    ) => {
      const { params, words, allWords } = action.payload;

      log.info('QuizzesSlice', 'Создание нового квиза', { params });

      const settings: QuizSettings = {
        ...DEFAULT_QUIZ_SETTINGS,
        ...params.settings,
      };

      const questions = generateQuestions(params.type, words, allWords, settings);

      if (questions.length === 0) {
        state.error = 'Не удалось сгенерировать вопросы для квиза';
        log.error('QuizzesSlice', 'Не удалось сгенерировать вопросы');
        return;
      }

      const quiz: Quiz = {
        id: `quiz-${Date.now()}`,
        type: params.type,
        moduleId: params.moduleId,
        collectionId: params.collectionId,
        category: params.category,
        subcategory: params.subcategory,
        questions,
        currentQuestionIndex: 0,
        settings,
        startTime: new Date().toISOString(),
        isCompleted: false,
        isPaused: false,
      };

      state.currentQuiz = quiz;
      state.isActive = true;
      state.stats = null;
      state.error = null;

      log.info('QuizzesSlice', 'Квиз создан', {
        id: quiz.id,
        questionsCount: questions.length,
      });
    },

    /**
     * Ответить на текущий вопрос
     */
    answerQuestion: (state, action: PayloadAction<string>) => {
      if (!state.currentQuiz || !state.isActive) {
        log.warn('QuizzesSlice', 'Попытка ответить без активного квиза');
        return;
      }

      const quiz = state.currentQuiz;
      const currentQuestion = quiz.questions[quiz.currentQuestionIndex];

      if (!currentQuestion) {
        log.error('QuizzesSlice', 'Текущий вопрос не найден');
        return;
      }

      const userAnswer = action.payload;
      const isCorrect =
        userAnswer.trim().toLowerCase() ===
        currentQuestion.correctAnswer.trim().toLowerCase();

      // Обновляем вопрос
      currentQuestion.userAnswer = userAnswer;
      currentQuestion.isCorrect = isCorrect;
      currentQuestion.answeredAt = new Date().toISOString();

      log.debug('QuizzesSlice', 'Ответ на вопрос', {
        questionId: currentQuestion.id,
        isCorrect,
      });
    },

    /**
     * Перейти к следующему вопросу
     */
    nextQuestion: (state) => {
      if (!state.currentQuiz || !state.isActive) return;

      const quiz = state.currentQuiz;

      if (quiz.currentQuestionIndex < quiz.questions.length - 1) {
        quiz.currentQuestionIndex++;
        log.debug('QuizzesSlice', 'Переход к следующему вопросу', {
          index: quiz.currentQuestionIndex,
        });
      } else {
        // Это был последний вопрос, завершаем квиз
        log.info('QuizzesSlice', 'Последний вопрос, завершаем квиз');
      }
    },

    /**
     * Перейти к предыдущему вопросу
     */
    previousQuestion: (state) => {
      if (!state.currentQuiz || !state.isActive) return;

      const quiz = state.currentQuiz;

      if (quiz.currentQuestionIndex > 0) {
        quiz.currentQuestionIndex--;
        log.debug('QuizzesSlice', 'Переход к предыдущему вопросу', {
          index: quiz.currentQuestionIndex,
        });
      }
    },

    /**
     * Перейти к конкретному вопросу
     */
    goToQuestion: (state, action: PayloadAction<number>) => {
      if (!state.currentQuiz || !state.isActive) return;

      const quiz = state.currentQuiz;
      const index = action.payload;

      if (index >= 0 && index < quiz.questions.length) {
        quiz.currentQuestionIndex = index;
        log.debug('QuizzesSlice', 'Переход к вопросу', { index });
      }
    },

    /**
     * Завершить квиз
     */
    completeQuiz: (state) => {
      if (!state.currentQuiz || !state.isActive) {
        log.warn('QuizzesSlice', 'Попытка завершить несуществующий квиз');
        return;
      }

      const quiz = state.currentQuiz;
      const endTime = new Date().toISOString();
      const startTime = new Date(quiz.startTime).getTime();
      const endTimeMs = new Date(endTime).getTime();
      const timeSpent = Math.round((endTimeMs - startTime) / 1000); // В секундах

      quiz.endTime = endTime;
      quiz.timeSpent = timeSpent;
      quiz.isCompleted = true;

      state.isActive = false;
      state.stats = calculateStats(quiz);
      state.history.push(quiz.id);

      log.info('QuizzesSlice', 'Квиз завершен', {
        id: quiz.id,
        timeSpent,
        stats: state.stats,
      });
    },

    /**
     * Приостановить квиз
     */
    pauseQuiz: (state) => {
      if (state.currentQuiz && state.isActive) {
        state.currentQuiz.isPaused = true;
        log.debug('QuizzesSlice', 'Квиз приостановлен');
      }
    },

    /**
     * Возобновить квиз
     */
    resumeQuiz: (state) => {
      if (state.currentQuiz && state.isActive) {
        state.currentQuiz.isPaused = false;
        log.debug('QuizzesSlice', 'Квиз возобновлен');
      }
    },

    /**
     * Сбросить текущий квиз
     */
    resetQuiz: (state) => {
      log.info('QuizzesSlice', 'Сброс текущего квиза');
      state.currentQuiz = null;
      state.isActive = false;
      state.stats = null;
      state.error = null;
    },

    /**
     * Очистить историю квизов
     */
    clearHistory: (state) => {
      state.history = [];
      log.info('QuizzesSlice', 'История квизов очищена');
    },

    /**
     * Установить ошибку
     */
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      log.error('QuizzesSlice', 'Ошибка установлена', { error: action.payload });
    },

    /**
     * Очистить ошибку
     */
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Actions
export const {
  createQuiz,
  answerQuestion,
  nextQuestion,
  previousQuestion,
  goToQuestion,
  completeQuiz,
  pauseQuiz,
  resumeQuiz,
  resetQuiz,
  clearHistory,
  setError,
  clearError,
} = quizzesSlice.actions;

// Selectors
export const selectCurrentQuiz = (state: RootState) => state.quizzes.currentQuiz;
export const selectIsActive = (state: RootState) => state.quizzes.isActive;
export const selectQuizStats = (state: RootState) => state.quizzes.stats;
export const selectQuizError = (state: RootState) => state.quizzes.error;
export const selectQuizHistory = (state: RootState) => state.quizzes.history;

export const selectCurrentQuestion = (state: RootState) => {
  const quiz = state.quizzes.currentQuiz;
  if (!quiz) return null;
  return quiz.questions[quiz.currentQuestionIndex] || null;
};

export const selectQuizProgress = (state: RootState) => {
  const quiz = state.quizzes.currentQuiz;
  if (!quiz) return { current: 0, total: 0, percentage: 0 };

  return {
    current: quiz.currentQuestionIndex + 1,
    total: quiz.questions.length,
    percentage: Math.round(((quiz.currentQuestionIndex + 1) / quiz.questions.length) * 100),
  };
};

export const selectIsQuizCompleted = (state: RootState) => {
  return state.quizzes.currentQuiz?.isCompleted || false;
};

export const selectIsQuizPaused = (state: RootState) => {
  return state.quizzes.currentQuiz?.isPaused || false;
};

// Reducer
export default quizzesSlice.reducer;

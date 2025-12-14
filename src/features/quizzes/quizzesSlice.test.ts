/**
 * Tests for quizzesSlice
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import quizzesReducer, {
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
} from './quizzesSlice';
import type { Word } from '@/shared/types';
import type { CreateQuizParams } from './types';

// Mock words для тестов
const mockWords: Word[] = [
  { id: 'word-1', english: 'apple', translation: 'яблоко', category: 'nouns' },
  { id: 'word-2', english: 'banana', translation: 'банан', category: 'nouns' },
  { id: 'word-3', english: 'orange', translation: 'апельсин', category: 'nouns' },
  { id: 'word-4', english: 'grape', translation: 'виноград', category: 'nouns' },
  { id: 'word-5', english: 'pear', translation: 'груша', category: 'nouns' },
];

type TestStore = ReturnType<typeof configureStore<{ quizzes: ReturnType<typeof quizzesReducer> }>>;

describe('quizzesSlice', () => {
  let store: TestStore;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        quizzes: quizzesReducer,
      },
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().quizzes;
      expect(state.currentQuiz).toBeNull();
      expect(state.isActive).toBe(false);
      expect(state.history).toEqual([]);
      expect(state.stats).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  describe('createQuiz', () => {
    it('should create a new quiz', () => {
      const params: CreateQuizParams = {
        type: 'multipleChoice',
        moduleId: 'A1',
        settings: { questionCount: 3 },
      };

      store.dispatch(
        createQuiz({
          params,
          words: mockWords,
          allWords: mockWords,
        })
      );

      const state = store.getState().quizzes;
      expect(state.currentQuiz).not.toBeNull();
      expect(state.isActive).toBe(true);
      expect(state.currentQuiz?.type).toBe('multipleChoice');
      expect(state.currentQuiz?.moduleId).toBe('A1');
      expect(state.currentQuiz?.questions).toHaveLength(3);
      expect(state.currentQuiz?.currentQuestionIndex).toBe(0);
    });

    it('should create quiz with default settings', () => {
      const params: CreateQuizParams = {
        type: 'trueFalse',
        moduleId: 'A1',
      };

      store.dispatch(
        createQuiz({
          params,
          words: mockWords,
          allWords: mockWords,
        })
      );

      const quiz = store.getState().quizzes.currentQuiz;
      expect(quiz?.settings.questionCount).toBe(20); // Default
      expect(quiz?.settings.shuffleQuestions).toBe(true); // Default
      expect(quiz?.settings.showCorrectAnswer).toBe(true); // Default
    });

    it('should merge custom settings with defaults', () => {
      const params: CreateQuizParams = {
        type: 'multipleChoice',
        moduleId: 'A1',
        settings: {
          questionCount: 10,
          shuffleQuestions: false,
        },
      };

      store.dispatch(
        createQuiz({
          params,
          words: mockWords,
          allWords: mockWords,
        })
      );

      const quiz = store.getState().quizzes.currentQuiz;
      expect(quiz?.settings.questionCount).toBe(10);
      expect(quiz?.settings.shuffleQuestions).toBe(false);
      expect(quiz?.settings.showCorrectAnswer).toBe(true); // Default
    });
  });

  describe('answerQuestion', () => {
    beforeEach(() => {
      const params: CreateQuizParams = {
        type: 'multipleChoice',
        moduleId: 'A1',
        settings: { questionCount: 3, shuffleQuestions: false },
      };

      store.dispatch(
        createQuiz({
          params,
          words: mockWords.slice(0, 3),
          allWords: mockWords,
        })
      );
    });

    it('should record correct answer', () => {
      const quiz = store.getState().quizzes.currentQuiz!;
      const currentQuestion = quiz.questions[0];
      const correctAnswer = currentQuestion.correctAnswer;

      store.dispatch(answerQuestion(correctAnswer));

      const updatedQuiz = store.getState().quizzes.currentQuiz!;
      const updatedQuestion = updatedQuiz.questions[0];

      expect(updatedQuestion.userAnswer).toBe(correctAnswer);
      expect(updatedQuestion.isCorrect).toBe(true);
      expect(updatedQuestion.answeredAt).toBeDefined();
    });

    it('should record incorrect answer', () => {
      store.dispatch(answerQuestion('неправильный ответ'));

      const quiz = store.getState().quizzes.currentQuiz!;
      const question = quiz.questions[0];

      expect(question.userAnswer).toBe('неправильный ответ');
      expect(question.isCorrect).toBe(false);
    });

    it('should be case insensitive', () => {
      const quiz = store.getState().quizzes.currentQuiz!;
      const correctAnswer = quiz.questions[0].correctAnswer.toUpperCase();

      store.dispatch(answerQuestion(correctAnswer));

      const updatedQuestion = store.getState().quizzes.currentQuiz!.questions[0];
      expect(updatedQuestion.isCorrect).toBe(true);
    });
  });

  describe('navigation', () => {
    beforeEach(() => {
      const params: CreateQuizParams = {
        type: 'multipleChoice',
        moduleId: 'A1',
        settings: { questionCount: 5, shuffleQuestions: false },
      };

      store.dispatch(
        createQuiz({
          params,
          words: mockWords,
          allWords: mockWords,
        })
      );
    });

    it('should move to next question', () => {
      expect(store.getState().quizzes.currentQuiz?.currentQuestionIndex).toBe(0);

      store.dispatch(nextQuestion());
      expect(store.getState().quizzes.currentQuiz?.currentQuestionIndex).toBe(1);

      store.dispatch(nextQuestion());
      expect(store.getState().quizzes.currentQuiz?.currentQuestionIndex).toBe(2);
    });

    it('should not go beyond last question', () => {
      const quiz = store.getState().quizzes.currentQuiz!;
      const lastIndex = quiz.questions.length - 1;

      store.dispatch(goToQuestion(lastIndex));
      expect(store.getState().quizzes.currentQuiz?.currentQuestionIndex).toBe(lastIndex);

      store.dispatch(nextQuestion());
      // Should stay at last question
      expect(store.getState().quizzes.currentQuiz?.currentQuestionIndex).toBe(lastIndex);
    });

    it('should move to previous question', () => {
      store.dispatch(goToQuestion(2));
      expect(store.getState().quizzes.currentQuiz?.currentQuestionIndex).toBe(2);

      store.dispatch(previousQuestion());
      expect(store.getState().quizzes.currentQuiz?.currentQuestionIndex).toBe(1);
    });

    it('should not go before first question', () => {
      expect(store.getState().quizzes.currentQuiz?.currentQuestionIndex).toBe(0);

      store.dispatch(previousQuestion());
      expect(store.getState().quizzes.currentQuiz?.currentQuestionIndex).toBe(0);
    });

    it('should go to specific question', () => {
      store.dispatch(goToQuestion(3));
      expect(store.getState().quizzes.currentQuiz?.currentQuestionIndex).toBe(3);

      store.dispatch(goToQuestion(1));
      expect(store.getState().quizzes.currentQuiz?.currentQuestionIndex).toBe(1);
    });

    it('should ignore invalid question index', () => {
      store.dispatch(goToQuestion(999));
      expect(store.getState().quizzes.currentQuiz?.currentQuestionIndex).toBe(0);

      store.dispatch(goToQuestion(-1));
      expect(store.getState().quizzes.currentQuiz?.currentQuestionIndex).toBe(0);
    });
  });

  describe('completeQuiz', () => {
    beforeEach(() => {
      const params: CreateQuizParams = {
        type: 'multipleChoice',
        moduleId: 'A1',
        settings: { questionCount: 3, shuffleQuestions: false },
      };

      store.dispatch(
        createQuiz({
          params,
          words: mockWords.slice(0, 3),
          allWords: mockWords,
        })
      );
    });

    it('should complete quiz and calculate stats', () => {
      const quiz = store.getState().quizzes.currentQuiz!;

      // Ответить на все вопросы
      store.dispatch(answerQuestion(quiz.questions[0].correctAnswer)); // Правильно
      store.dispatch(nextQuestion());

      store.dispatch(answerQuestion('неправильно')); // Неправильно
      store.dispatch(nextQuestion());

      store.dispatch(answerQuestion(quiz.questions[2].correctAnswer)); // Правильно
      store.dispatch(nextQuestion());

      // Завершить квиз
      store.dispatch(completeQuiz());

      const state = store.getState().quizzes;

      expect(state.isActive).toBe(false);
      expect(state.currentQuiz?.isCompleted).toBe(true);
      expect(state.currentQuiz?.endTime).toBeDefined();
      expect(state.currentQuiz?.timeSpent).toBeDefined();

      expect(state.stats).not.toBeNull();
      expect(state.stats?.totalQuestions).toBe(3);
      expect(state.stats?.answeredQuestions).toBe(3);
      expect(state.stats?.correctAnswers).toBe(2);
      expect(state.stats?.incorrectAnswers).toBe(1);
      expect(state.stats?.accuracy).toBe(67); // 2/3 = 66.67% ≈ 67%

      expect(state.history).toHaveLength(1);
      expect(state.history[0]).toBe(quiz.id);
    });

    it('should handle partially completed quiz', () => {
      const quiz = store.getState().quizzes.currentQuiz!;

      // Ответить только на 2 из 3 вопросов
      store.dispatch(answerQuestion(quiz.questions[0].correctAnswer));
      store.dispatch(nextQuestion());
      store.dispatch(answerQuestion(quiz.questions[1].correctAnswer));
      // Третий вопрос пропускаем

      store.dispatch(completeQuiz());

      const stats = store.getState().quizzes.stats!;
      expect(stats.answeredQuestions).toBe(2);
      expect(stats.skippedQuestions).toBe(1);
      expect(stats.accuracy).toBe(100); // 2/2 = 100%
    });
  });

  describe('pauseQuiz and resumeQuiz', () => {
    beforeEach(() => {
      const params: CreateQuizParams = {
        type: 'multipleChoice',
        moduleId: 'A1',
      };

      store.dispatch(
        createQuiz({
          params,
          words: mockWords,
          allWords: mockWords,
        })
      );
    });

    it('should pause active quiz', () => {
      expect(store.getState().quizzes.currentQuiz?.isPaused).toBe(false);

      store.dispatch(pauseQuiz());

      expect(store.getState().quizzes.currentQuiz?.isPaused).toBe(true);
      expect(store.getState().quizzes.isActive).toBe(true); // Квиз все еще активен
    });

    it('should resume paused quiz', () => {
      store.dispatch(pauseQuiz());
      expect(store.getState().quizzes.currentQuiz?.isPaused).toBe(true);

      store.dispatch(resumeQuiz());

      expect(store.getState().quizzes.currentQuiz?.isPaused).toBe(false);
    });
  });

  describe('resetQuiz', () => {
    it('should reset quiz state', () => {
      const params: CreateQuizParams = {
        type: 'multipleChoice',
        moduleId: 'A1',
      };

      store.dispatch(
        createQuiz({
          params,
          words: mockWords,
          allWords: mockWords,
        })
      );

      expect(store.getState().quizzes.currentQuiz).not.toBeNull();
      expect(store.getState().quizzes.isActive).toBe(true);

      store.dispatch(resetQuiz());

      const state = store.getState().quizzes;
      expect(state.currentQuiz).toBeNull();
      expect(state.isActive).toBe(false);
      expect(state.stats).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  describe('clearHistory', () => {
    it('should clear quiz history', () => {
      // Создаем и завершаем несколько квизов
      for (let i = 0; i < 3; i++) {
        const params: CreateQuizParams = {
          type: 'multipleChoice',
          moduleId: 'A1',
          settings: { questionCount: 1 },
        };

        store.dispatch(
          createQuiz({
            params,
            words: [mockWords[0]],
            allWords: mockWords,
          })
        );

        store.dispatch(completeQuiz());
      }

      expect(store.getState().quizzes.history).toHaveLength(3);

      store.dispatch(clearHistory());

      expect(store.getState().quizzes.history).toEqual([]);
    });
  });
});

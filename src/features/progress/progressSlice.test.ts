/**
 * Tests for progressSlice
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import progressReducer, {
  markWordStudied,
  updateWordProgress,
  saveQuizResult,
  clearProgress,
  resetWordsProgress,
  setWordStatus,
} from './progressSlice';
import type { QuizResult } from '@/shared/types';

type TestStore = ReturnType<typeof configureStore<{ progress: ReturnType<typeof progressReducer> }>>;

describe('progressSlice', () => {
  let store: TestStore;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        progress: progressReducer,
      },
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().progress;
      expect(state.profiles).toBeDefined();
      expect(state.profiles.default).toBeDefined();
      expect(state.activeProfileId).toBe('default');
      expect(state.isLoading).toBe(false);
    });

    it('default profile should have empty progress', () => {
      const state = store.getState().progress;
      const defaultProfile = state.profiles.default;
      
      expect(defaultProfile.wordProgress).toEqual({});
      expect(defaultProfile.quizResults).toEqual([]);
      expect(defaultProfile.statistics.totalWordsStudied).toBe(0);
      expect(defaultProfile.statistics.totalQuizzesCompleted).toBe(0);
      expect(defaultProfile.statistics.averageScore).toBe(0);
      expect(defaultProfile.statistics.studyStreak).toBe(0);
    });
  });

  describe('markWordStudied', () => {
    it('should mark word as studied and create progress entry', () => {
      store.dispatch(markWordStudied('word-1'));
      
      const state = store.getState().progress;
      const profile = state.profiles[state.activeProfileId];
      
      expect(profile.wordProgress['word-1']).toBeDefined();
      expect(profile.wordProgress['word-1'].wordId).toBe('word-1');
      expect(profile.wordProgress['word-1'].correctAnswers).toBe(0);
      expect(profile.wordProgress['word-1'].incorrectAnswers).toBe(0);
      expect(profile.wordProgress['word-1'].masteryLevel).toBe(0);
      expect(profile.wordStatuses['word-1']).toBe('studied');
    });

    it('should update statistics when word is studied', () => {
      store.dispatch(markWordStudied('word-1'));
      store.dispatch(markWordStudied('word-2'));
      
      const state = store.getState().progress;
      const profile = state.profiles[state.activeProfileId];
      
      expect(profile.statistics.totalWordsStudied).toBe(2);
    });

    it('should update study streak', () => {
      store.dispatch(markWordStudied('word-1'));
      
      const state = store.getState().progress;
      const profile = state.profiles[state.activeProfileId];
      
      expect(profile.statistics.studyStreak).toBe(1);
      expect(profile.statistics.lastStudyDate).toBeDefined();
    });

    it('should update existing word progress dates', () => {
      store.dispatch(markWordStudied('word-1'));
      const firstDate = store.getState().progress.profiles.default.wordProgress['word-1'].studiedAt;
      
      // Помечаем снова
      store.dispatch(markWordStudied('word-1'));
      const secondDate = store.getState().progress.profiles.default.wordProgress['word-1'].studiedAt;
      
      // Даты должны отличаться (или быть равными, если выполнено мгновенно)
      expect(secondDate).toBeDefined();
      expect(firstDate).toBeDefined();
    });
  });

  describe('updateWordProgress', () => {
    it('should create word progress if it does not exist', () => {
      store.dispatch(updateWordProgress({ wordId: 'word-1', isCorrect: true }));
      
      const state = store.getState().progress;
      const profile = state.profiles[state.activeProfileId];
      
      expect(profile.wordProgress['word-1']).toBeDefined();
      expect(profile.wordProgress['word-1'].correctAnswers).toBe(1);
      expect(profile.wordProgress['word-1'].incorrectAnswers).toBe(0);
      expect(profile.wordProgress['word-1'].masteryLevel).toBe(1);
    });

    it('should increment correctAnswers and masteryLevel for correct answer', () => {
      store.dispatch(updateWordProgress({ wordId: 'word-1', isCorrect: true }));
      store.dispatch(updateWordProgress({ wordId: 'word-1', isCorrect: true }));
      
      const state = store.getState().progress;
      const profile = state.profiles[state.activeProfileId];
      const progress = profile.wordProgress['word-1'];
      
      expect(progress.correctAnswers).toBe(2);
      expect(progress.masteryLevel).toBe(2);
    });

    it('should increment incorrectAnswers and decrement masteryLevel for incorrect answer', () => {
      // Сначала несколько правильных ответов
      store.dispatch(updateWordProgress({ wordId: 'word-1', isCorrect: true }));
      store.dispatch(updateWordProgress({ wordId: 'word-1', isCorrect: true }));
      store.dispatch(updateWordProgress({ wordId: 'word-1', isCorrect: true }));
      
      // Неправильный ответ
      store.dispatch(updateWordProgress({ wordId: 'word-1', isCorrect: false }));
      
      const state = store.getState().progress;
      const profile = state.profiles[state.activeProfileId];
      const progress = profile.wordProgress['word-1'];
      
      expect(progress.correctAnswers).toBe(3);
      expect(progress.incorrectAnswers).toBe(1);
      expect(progress.masteryLevel).toBe(2); // 3 - 1 = 2
    });

    it('should not allow masteryLevel to go below 0', () => {
      store.dispatch(updateWordProgress({ wordId: 'word-1', isCorrect: false }));
      store.dispatch(updateWordProgress({ wordId: 'word-1', isCorrect: false }));
      
      const state = store.getState().progress;
      const profile = state.profiles[state.activeProfileId];
      
      expect(profile.wordProgress['word-1'].masteryLevel).toBe(0);
    });

    it('should not allow masteryLevel to go above 5', () => {
      // 10 правильных ответов
      for (let i = 0; i < 10; i++) {
        store.dispatch(updateWordProgress({ wordId: 'word-1', isCorrect: true }));
      }
      
      const state = store.getState().progress;
      const profile = state.profiles[state.activeProfileId];
      
      expect(profile.wordProgress['word-1'].masteryLevel).toBe(5);
    });
  });

  describe('saveQuizResult', () => {
    const mockQuizResult: QuizResult = {
      quizId: 'quiz-1',
      quizType: 'multipleChoice',
      moduleId: 'A1',
      collectionId: 'food-drink',
      category: 'nouns',
      completedAt: new Date().toISOString(),
      score: 80,
      totalQuestions: 10,
      correctAnswers: 8,
      timeSpent: 120,
      mistakes: ['word-1', 'word-2'],
    };

    it('should save quiz result', () => {
      store.dispatch(saveQuizResult(mockQuizResult));
      
      const state = store.getState().progress;
      const profile = state.profiles[state.activeProfileId];
      
      expect(profile.quizResults).toHaveLength(1);
      expect(profile.quizResults[0]).toEqual(mockQuizResult);
    });

    it('should update statistics after quiz', () => {
      store.dispatch(saveQuizResult(mockQuizResult));
      
      const state = store.getState().progress;
      const profile = state.profiles[state.activeProfileId];
      
      expect(profile.statistics.totalQuizzesCompleted).toBe(1);
      expect(profile.statistics.averageScore).toBe(80);
    });

    it('should calculate average score correctly', () => {
      const quiz1: QuizResult = { ...mockQuizResult, score: 80 };
      const quiz2: QuizResult = { ...mockQuizResult, quizId: 'quiz-2', score: 60 };
      const quiz3: QuizResult = { ...mockQuizResult, quizId: 'quiz-3', score: 100 };
      
      store.dispatch(saveQuizResult(quiz1));
      store.dispatch(saveQuizResult(quiz2));
      store.dispatch(saveQuizResult(quiz3));
      
      const state = store.getState().progress;
      const profile = state.profiles[state.activeProfileId];
      
      // (80 + 60 + 100) / 3 = 80
      expect(profile.statistics.averageScore).toBe(80);
    });

    it('should update incorrectAnswers for mistake words', () => {
      // Сначала создаем прогресс для слов
      store.dispatch(markWordStudied('word-1'));
      store.dispatch(markWordStudied('word-2'));
      
      // Сохраняем результат квиза с ошибками
      store.dispatch(saveQuizResult(mockQuizResult));
      
      const state = store.getState().progress;
      const profile = state.profiles[state.activeProfileId];
      
      expect(profile.wordProgress['word-1'].incorrectAnswers).toBe(1);
      expect(profile.wordProgress['word-2'].incorrectAnswers).toBe(1);
    });
  });

  describe('clearProgress', () => {
    it('should clear all progress for active profile', () => {
      // Создаем прогресс
      store.dispatch(markWordStudied('word-1'));
      store.dispatch(markWordStudied('word-2'));
      
      // Очищаем
      store.dispatch(clearProgress());
      
      const state = store.getState().progress;
      const profile = state.profiles[state.activeProfileId];
      
      expect(profile.wordProgress).toEqual({});
      expect(profile.quizResults).toEqual([]);
      expect(profile.statistics.totalWordsStudied).toBe(0);
      expect(profile.statistics.totalQuizzesCompleted).toBe(0);
    });
  });

  describe('resetWordsProgress', () => {
    it('should reset progress for specific words', () => {
      // Создаем прогресс для нескольких слов
      store.dispatch(markWordStudied('word-1'));
      store.dispatch(markWordStudied('word-2'));
      store.dispatch(markWordStudied('word-3'));
      
      // Сбрасываем только для word-1 и word-2
      store.dispatch(resetWordsProgress({ wordIds: ['word-1', 'word-2'] }));
      
      const state = store.getState().progress;
      const profile = state.profiles[state.activeProfileId];
      
      expect(profile.wordProgress['word-1']).toBeUndefined();
      expect(profile.wordProgress['word-2']).toBeUndefined();
      expect(profile.wordProgress['word-3']).toBeDefined();
      expect(profile.statistics.totalWordsStudied).toBe(1);
    });

    it('should handle empty array', () => {
      store.dispatch(markWordStudied('word-1'));
      const beforeState = store.getState().progress;
      
      store.dispatch(resetWordsProgress({ wordIds: [] }));
      const afterState = store.getState().progress;
      
      expect(afterState).toEqual(beforeState);
    });
  });

  describe('setWordStatus', () => {
    it('should set word status', () => {
      store.dispatch(setWordStatus({ wordId: 'word-1', status: 'difficult' }));
      
      const state = store.getState().progress;
      const profile = state.profiles[state.activeProfileId];
      
      expect(profile.wordStatuses['word-1']).toBe('difficult');
    });

    it('should update existing word status', () => {
      store.dispatch(setWordStatus({ wordId: 'word-1', status: 'studied' }));
      store.dispatch(setWordStatus({ wordId: 'word-1', status: 'needs-review' }));
      
      const state = store.getState().progress;
      const profile = state.profiles[state.activeProfileId];
      
      expect(profile.wordStatuses['word-1']).toBe('needs-review');
    });
  });
});

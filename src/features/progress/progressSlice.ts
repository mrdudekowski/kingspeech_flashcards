/**
 * Progress Slice - управление прогрессом изучения слов
 */

// 1. Redux Toolkit
import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';

// 2. Типы из store
import type { RootState } from '@/app/store';

// 3. Общие типы
import type {
  WordProgress,
  QuizResult,
  ProgressStatistics,
  Word,
  WordStatus,
} from '@/shared/types';

// 4. Локальные типы
import type {
  ProgressProfilesMap,
  ProgressState,
  ProfileProgressState,
} from './types';

// 5. Утилиты
import { calculateStreak } from './utils/streakCalculator';

// 6. Селекторы из vocabulary (для расчета прогресса)
import {
  selectCurrentSubcategoryWords,
  selectAllWordsInModule,
  selectCurrentModule,
  selectCurrentCollectionWords,
} from '@/features/vocabulary/vocabularySlice';

const DEFAULT_PROFILE_ID = 'default';

const createEmptyStatistics = (): ProgressStatistics => ({
  totalWordsStudied: 0,
  totalQuizzesCompleted: 0,
  averageScore: 0,
  studyStreak: 0,
});

const createEmptyProfile = (): ProfileProgressState => ({
  wordProgress: {},
  quizResults: [],
  statistics: createEmptyStatistics(),
  wordStatuses: {},
});

const ensureProfile = (profiles: ProgressProfilesMap, profileId: string): ProfileProgressState => {
  if (!profiles[profileId]) {
    profiles[profileId] = createEmptyProfile();
  }
  const profile = profiles[profileId];
  if (!profile.wordStatuses) {
    profile.wordStatuses = {};
  }
  return profile;
};

const getActiveProfile = (state: ProgressState): ProfileProgressState => {
  const activeId = state.activeProfileId || DEFAULT_PROFILE_ID;
  return ensureProfile(state.profiles, activeId);
};

const initialState: ProgressState = {
  profiles: {
    [DEFAULT_PROFILE_ID]: createEmptyProfile(),
  },
  activeProfileId: DEFAULT_PROFILE_ID,
  isLoading: false,
};

type LoadProgressPayload = {
  profiles: ProgressProfilesMap;
  activeProfileId?: string;
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    // Отметить слово как изученное
    markWordStudied: (state, action: PayloadAction<string>) => {
      const profile = getActiveProfile(state);
      const wordId = action.payload;
      const now = new Date().toISOString();

      // Если слово уже есть в прогрессе - обновляем только даты
      if (profile.wordProgress[wordId]) {
        profile.wordProgress[wordId].studiedAt = now;
        profile.wordProgress[wordId].lastReviewedAt = now;
      } else {
        // Создаем базовый прогресс для слова без изменения счетчиков
        profile.wordProgress[wordId] = {
          wordId,
          studiedAt: now,
          correctAnswers: 0,
          incorrectAnswers: 0,
          lastReviewedAt: now,
          masteryLevel: 0,
        };
      }
      profile.wordStatuses[wordId] = 'studied';
      
      // Обновляем статистику
      profile.statistics.totalWordsStudied = Object.keys(profile.wordProgress).length;
      
      // Сохраняем предыдущую дату изучения для расчета streak
      const previousLastStudyDate = profile.statistics.lastStudyDate;

      // Обновляем streak на основе ПРЕДЫДУЩЕЙ даты изучения
      if (previousLastStudyDate) {
        const newStreak = calculateStreak(
          previousLastStudyDate,
          profile.statistics.studyStreak
        );
        profile.statistics.studyStreak = newStreak;
      } else {
        // Первое изучение вообще - начинаем streak
        profile.statistics.studyStreak = 1;
      }

      // Обновляем дату последнего изучения уже после пересчета streak
      profile.statistics.lastStudyDate = now;
    },

    // Обновить прогресс слова (правильные/неправильные ответы)
    updateWordProgress: (
      state,
      action: PayloadAction<{
        wordId: string;
        isCorrect: boolean;
      }>
    ) => {
      const profile = getActiveProfile(state);
      const { wordId, isCorrect } = action.payload;
      const now = new Date().toISOString();
      
      // Если слова нет - создаем
      if (!profile.wordProgress[wordId]) {
        profile.wordProgress[wordId] = {
          wordId,
          studiedAt: now,
          correctAnswers: 0,
          incorrectAnswers: 0,
          masteryLevel: 0,
        };
      }
      
      const progress = profile.wordProgress[wordId];
      
      // Обновляем счетчики
      if (isCorrect) {
        progress.correctAnswers += 1;
        progress.masteryLevel = Math.min(progress.masteryLevel + 1, 5);
      } else {
        progress.incorrectAnswers += 1;
        progress.masteryLevel = Math.max(progress.masteryLevel - 1, 0);
      }
      
      progress.lastReviewedAt = now;
    },

    // Сохранить результат квиза
    saveQuizResult: (state, action: PayloadAction<QuizResult>) => {
      const profile = getActiveProfile(state);
      const quizResult = action.payload;
      
      // Добавляем результат квиза
      profile.quizResults.push(quizResult);
      
      // Обновляем слова с ошибками
      quizResult.mistakes.forEach((wordId) => {
        if (profile.wordProgress[wordId]) {
          profile.wordProgress[wordId].incorrectAnswers += 1;
          profile.wordProgress[wordId].masteryLevel = Math.max(
            profile.wordProgress[wordId].masteryLevel - 1,
            0
          );
        }
      });
      
      // Обновляем статистику
      profile.statistics.totalQuizzesCompleted = profile.quizResults.length;
      
      // Пересчитываем средний балл
      const totalScore = profile.quizResults.reduce((sum, q) => sum + q.score, 0);
      profile.statistics.averageScore = Math.round(
        totalScore / profile.quizResults.length || 0
      );
    },

    // Загрузить прогресс из localStorage
    loadProgress: (state, action: PayloadAction<LoadProgressPayload>) => {
      state.profiles = action.payload.profiles;
      state.activeProfileId = action.payload.activeProfileId || DEFAULT_PROFILE_ID;
      Object.keys(state.profiles).forEach((profileId) => {
        ensureProfile(state.profiles, profileId);
      });
      state.isLoading = false;
    },

    // Установить флаг загрузки
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Очистить весь прогресс активного профиля
    clearProgress: (state) => {
      state.profiles[state.activeProfileId] = createEmptyProfile();
    },

    // Сброс прогресса выбранных слов (по ID)
    resetWordsProgress: (state, action: PayloadAction<{ wordIds: string[] }>) => {
      const profile = getActiveProfile(state);
      const { wordIds } = action.payload;

      if (!wordIds || wordIds.length === 0) {
        return;
      }

      wordIds.forEach((wordId) => {
        if (!wordId) {
          return;
        }
        delete profile.wordProgress[wordId];
        delete profile.wordStatuses[wordId];
      });

      profile.statistics.totalWordsStudied = Object.keys(profile.wordProgress).length;
    },

    // Смена активного профиля
    setActiveProfile: (state, action: PayloadAction<string>) => {
      const nextProfileId = action.payload || DEFAULT_PROFILE_ID;
      state.activeProfileId = nextProfileId;
      ensureProfile(state.profiles, nextProfileId);
    },

    setWordStatus: (
      state,
      action: PayloadAction<{
        wordId: string;
        status: WordStatus;
      }>
    ) => {
      const profile = getActiveProfile(state);
      profile.wordStatuses[action.payload.wordId] = action.payload.status;
    },
  },
});

// Экспорт actions
export const {
  markWordStudied,
  updateWordProgress,
  saveQuizResult,
  loadProgress,
  setLoading,
  clearProgress,
  resetWordsProgress,
  setActiveProfile,
  setWordStatus,
} = progressSlice.actions;

const selectProgressSlice = (state: RootState) => state.progress;

export const selectActiveProfileId = (state: RootState): string =>
  selectProgressSlice(state).activeProfileId;

const emptyProfileSnapshot = createEmptyProfile();

const selectActiveProfileData = (state: RootState): ProfileProgressState => {
  const slice = selectProgressSlice(state);
  return slice.profiles[slice.activeProfileId] ?? emptyProfileSnapshot;
};

// Базовые селекторы
export const selectWordProgress = (state: RootState): Record<string, WordProgress> =>
  selectActiveProfileData(state).wordProgress;

export const selectQuizResults = (state: RootState): QuizResult[] =>
  selectActiveProfileData(state).quizResults;

export const selectStatistics = (state: RootState): ProgressStatistics =>
  selectActiveProfileData(state).statistics;

export const selectIsLoading = (state: RootState): boolean =>
  selectProgressSlice(state).isLoading;

export const selectWordStatuses = (state: RootState): Record<string, WordStatus> =>
  selectActiveProfileData(state).wordStatuses;

export const selectWordStatusById =
  (wordId: string) =>
  (state: RootState): WordStatus =>
    selectWordStatuses(state)[wordId] || 'new';

// Составные селекторы
// Прогресс конкретного слова
export const selectWordProgressById = (wordId: string) => (state: RootState): WordProgress | undefined =>
  selectWordProgress(state)[wordId];

// Все изученные слова (ID)
export const selectStudiedWords = (state: RootState): string[] =>
  Object.keys(selectWordProgress(state));

/**
 * Прогресс по текущей категории/подкатегории
 * Возвращает процент изученных слов (0-100)
 * Слово считается изученным, если masteryLevel >= 1
 */
export const selectCurrentCategoryProgress = createSelector(
  [selectCurrentSubcategoryWords, selectWordProgress],
  (words: Word[], wordProgress: Record<string, WordProgress>): number => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 [selectCurrentCategoryProgress] Пересчет для', words.length, 'слов');
    }
    
    // Защита от undefined/null
    if (!words || words.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log('⏭️ [selectCurrentCategoryProgress] Нет слов, возвращаем 0');
      }
      return 0;
    }
    if (!wordProgress) {
      if (process.env.NODE_ENV === 'development') {
        console.log('⏭️ [selectCurrentCategoryProgress] Нет wordProgress, возвращаем 0');
      }
      return 0;
    }
    
    const studiedCount = words.filter((word) => {
      if (!word || !word.id) return false;
      const progress = wordProgress[word.id];
      // Слово считается изученным, если есть прогресс с masteryLevel >= 1
      return progress && progress.masteryLevel >= 1;
    }).length;
    
    const result = Math.round((studiedCount / words.length) * 100);
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [selectCurrentCategoryProgress] Результат:', result + '%', `(${studiedCount}/${words.length})`);
    }
    return result;
  }
);

/**
 * Прогресс по текущему модулю
 * Возвращает процент изученных слов модуля (0-100)
 * Слово считается изученным, если masteryLevel >= 1
 */
export const selectCurrentModuleProgress = createSelector(
  [selectAllWordsInModule, selectWordProgress, selectCurrentModule],
  (
    allWords: Word[],
    wordProgress: Record<string, WordProgress>,
    currentModule: string | null
  ): number => {
    if (!currentModule || allWords.length === 0) return 0;
    
    const studiedCount = allWords.filter((word) => {
      const progress = wordProgress[word.id];
      // Слово считается изученным, если есть прогресс с masteryLevel >= 1
      return progress && progress.masteryLevel >= 1;
    }).length;
    
    return Math.round((studiedCount / allWords.length) * 100);
  }
);

/**
 * Статистика текущего модуля
 * Возвращает объект с количеством изученных, сложных и изучаемых слов для всего модуля
 */
export const selectCurrentModuleStats = createSelector(
  [selectAllWordsInModule, selectWordProgress, selectCurrentModule],
  (
    allWords: Word[],
    wordProgress: Record<string, WordProgress>,
    currentModule: string | null
  ): {
    total: number;
    studied: number;
    difficult: number;
    studying: number;
    progress: number;
  } => {
    // Защита от undefined/null
    if (!currentModule || !allWords || allWords.length === 0) {
      return {
        total: 0,
        studied: 0,
        difficult: 0,
        studying: 0,
        progress: 0,
      };
    }
    if (!wordProgress) {
      return {
        total: allWords.length,
        studied: 0,
        difficult: 0,
        studying: allWords.length,
        progress: 0,
      };
    }

    let studied = 0;
    let difficult = 0;
    let studying = 0;

    allWords.forEach((word) => {
      if (!word || !word.id) return;
      const progress = wordProgress[word.id];
      if (progress) {
        if (progress.masteryLevel >= 1) {
          studied++;
        } else if (progress.masteryLevel === 0 && progress.incorrectAnswers > progress.correctAnswers) {
          difficult++;
        } else if (progress.masteryLevel === 0) {
          studying++;
        }
      } else {
        studying++; // Новое слово, еще не изучалось
      }
    });

    const progress = Math.round((studied / allWords.length) * 100);

    return {
      total: allWords.length,
      studied,
      difficult,
      studying,
      progress,
    };
  }
);

/**
 * Статистика текущей категории
 * Возвращает объект с количеством изученных, сложных и изучаемых слов
 */
export const selectCurrentCategoryStats = createSelector(
  [selectCurrentSubcategoryWords, selectWordProgress],
  (
    words: Word[],
    wordProgress: Record<string, WordProgress>
  ): {
    total: number;
    studied: number;
    difficult: number;
    studying: number;
    progress: number;
  } => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 [selectCurrentCategoryStats] Пересчет для', words.length, 'слов');
    }
    
    // Защита от undefined/null
    if (!words || words.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log('⏭️ [selectCurrentCategoryStats] Нет слов, возвращаем пустые данные');
      }
      return {
        total: 0,
        studied: 0,
        difficult: 0,
        studying: 0,
        progress: 0,
      };
    }
    if (!wordProgress) {
      if (process.env.NODE_ENV === 'development') {
        console.log('⏭️ [selectCurrentCategoryStats] Нет wordProgress, возвращаем данные без прогресса');
      }
      return {
        total: words.length,
        studied: 0,
        difficult: 0,
        studying: words.length,
        progress: 0,
      };
    }
    
    let studied = 0;
    let difficult = 0;
    let studying = 0;
    
    words.forEach((word) => {
      if (!word || !word.id) return;
      const progress = wordProgress[word.id];
      if (progress) {
        if (progress.masteryLevel >= 1) {
          studied++;
        } else if (progress.masteryLevel === 0 && progress.incorrectAnswers > progress.correctAnswers) {
          difficult++;
        } else if (progress.masteryLevel === 0) {
          studying++;
        }
      } else {
        studying++; // Новое слово, еще не изучалось
      }
    });
    
    const progress = Math.round((studied / words.length) * 100);
    
    const result = {
      total: words.length,
      studied,
      difficult,
      studying,
      progress,
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [selectCurrentCategoryStats] Результат:', result);
    }
    
    return result;
  }
);

/**
 * Прогресс категории по collectionId и category
 * Для использования на CollectionPage для отображения прогресса в кнопках категорий
 */
export const selectCategoryProgressByCollection = createSelector(
  [
    selectCurrentCollectionWords,
    selectWordProgress,
    (_: RootState, category: string) => category,
  ],
  (
    collectionWords: Word[],
    wordProgress: Record<string, WordProgress>,
    category: string
  ): number => {
    // Защита от undefined/null
    if (!category || typeof category !== 'string') return 0;
    if (!collectionWords || collectionWords.length === 0) return 0;
    if (!wordProgress) return 0;
    
    // Фильтруем слова по категории
    const categoryWords = collectionWords.filter((word) => word && word.category === category);
    if (categoryWords.length === 0) return 0;
    
    const studiedCount = categoryWords.filter((word) => {
      if (!word || !word.id) return false;
      const progress = wordProgress[word.id];
      return progress && progress.masteryLevel >= 1;
    }).length;
    
    return Math.round((studiedCount / categoryWords.length) * 100);
  }
);

// Экспорт reducer
export default progressSlice.reducer;


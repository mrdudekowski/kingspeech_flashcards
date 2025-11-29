/**
 * Vocabulary Slice - управление словарным модулем
 * Отвечает за выбор модуля, подборки, категории и загрузку данных
 */

import { createSlice, PayloadAction, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';
import type { ModuleId, WordCategory, WordSubcategory } from '@/app/constants';
import type { VocabularyModule, Word } from '@/shared/types';
import type { VocabularyState } from './types';
import { getWordsForCollection } from '@/shared/utils/tags';
import { loadModule, VocabularyLoadError } from '@/services/vocabularyLoader';

const initialState: VocabularyState = {
  currentModule: null,
  currentCollection: null,
  currentCategory: null,
  currentSubcategory: null,
  vocabularyData: null,
  loading: 'idle',
  error: null,
};

// ============================================
// Async Thunks
// ============================================

/**
 * Async thunk для загрузки модуля словаря
 */
export const loadVocabularyModule = createAsyncThunk<
  VocabularyModule, // Тип возвращаемого значения
  ModuleId, // Тип аргумента
  { rejectValue: string } // Тип значения при reject
>(
  'vocabulary/loadModule',
  async (moduleId, { rejectWithValue }) => {
    try {
      const data = await loadModule(moduleId);
      return data;
    } catch (error) {
      // Обработка ошибок
      if (error instanceof VocabularyLoadError) {
        return rejectWithValue(error.message);
      }
      
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      
      return rejectWithValue('Неизвестная ошибка при загрузке модуля');
    }
  }
);

const vocabularySlice = createSlice({
  name: 'vocabulary',
  initialState,
  reducers: {
    // Выбор текущего модуля (A1, A2, etc.)
    setCurrentModule: (state, action: PayloadAction<ModuleId | null>) => {
      state.currentModule = action.payload;
      // При смене модуля сбрасываем подборку, категорию и подкатегорию
      state.currentCollection = null;
      state.currentCategory = null;
      state.currentSubcategory = null;
    },

    // Выбор текущей подборки (Travelling, Food, etc.)
    setCurrentCollection: (state, action: PayloadAction<string | null>) => {
      state.currentCollection = action.payload;
      // При смене подборки сбрасываем категорию и подкатегорию
      state.currentCategory = null;
      state.currentSubcategory = null;
    },

    // Выбор текущей категории (phrases, verbs, etc.)
    setCurrentCategory: (state, action: PayloadAction<WordCategory | null>) => {
      state.currentCategory = action.payload;
      // При смене категории сбрасываем подкатегорию
      state.currentSubcategory = null;
    },

    // Выбор текущей подкатегории (regularVerbs, idioms, etc.)
    setCurrentSubcategory: (state, action: PayloadAction<WordSubcategory | string | null>) => {
      state.currentSubcategory = action.payload;
    },

    // Установка загруженных данных модуля
    setVocabularyData: (state, action: PayloadAction<VocabularyModule | null>) => {
      state.vocabularyData = action.payload;
      state.loading = 'succeeded';
      state.error = null;
    },

    // Установка состояния загрузки
    setLoading: (state, action: PayloadAction<'idle' | 'loading' | 'succeeded' | 'failed'>) => {
      state.loading = action.payload;
    },

    // Установка ошибки
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = 'failed';
    },

    // Сброс состояния
    resetVocabulary: (state) => {
      state.currentModule = null;
      state.currentCollection = null;
      state.currentCategory = null;
      state.currentSubcategory = null;
      state.vocabularyData = null;
      state.loading = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Обработка pending состояния
      .addCase(loadVocabularyModule.pending, (state) => {
        state.loading = 'loading';
        state.error = null;
      })
      // Обработка успешной загрузки
      .addCase(loadVocabularyModule.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.vocabularyData = action.payload;
        state.currentModule = action.payload.moduleId;
        state.error = null;
        // Сбрасываем подборку, категорию и подкатегорию при загрузке нового модуля
        state.currentCollection = null;
        state.currentCategory = null;
        state.currentSubcategory = null;
      })
      // Обработка ошибки загрузки
      .addCase(loadVocabularyModule.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload || 'Ошибка загрузки модуля';
        state.vocabularyData = null;
      });
  },
});

// ============================================
// Actions
// ============================================
export const {
  setCurrentModule,
  setCurrentCollection,
  setCurrentCategory,
  setCurrentSubcategory,
  setVocabularyData,
  setLoading,
  setError,
  resetVocabulary,
} = vocabularySlice.actions;

// ============================================
// Селекторы
// ============================================

// Базовые селекторы
export const selectCurrentModule = (state: RootState) => state.vocabulary.currentModule;
export const selectCurrentCollection = (state: RootState) => state.vocabulary.currentCollection;
export const selectCurrentCategory = (state: RootState) => state.vocabulary.currentCategory;
export const selectCurrentSubcategory = (state: RootState) => state.vocabulary.currentSubcategory;
export const selectVocabularyData = (state: RootState) => state.vocabulary.vocabularyData;
export const selectLoading = (state: RootState) => state.vocabulary.loading;
export const selectError = (state: RootState) => state.vocabulary.error;

// Составные селекторы
const selectCurrentCollectionId = (state: RootState) => state.vocabulary.currentCollection;

export const selectCurrentCollectionData = createSelector(
  [selectVocabularyData, selectCurrentCollectionId],
  (vocabularyData, currentCollection) => {
    if (!vocabularyData || !currentCollection) return null;
    return vocabularyData.collections.find((c) => c.id === currentCollection) || null;
  }
);

/**
 * Получить все слова модуля (для поиска по тегам)
 */
export const selectAllWordsInModule = createSelector([selectVocabularyData], (vocabularyData) => {
  if (!vocabularyData) return [];

  // Собираем все слова из всех подборок
  const allWords: Word[] = [];
  vocabularyData.collections.forEach((collection) => {
    Object.values(collection.categories).forEach((words) => {
      allWords.push(...words);
    });
  });

  return allWords;
});

/**
 * Селектор для всех слов текущей подборки (без фильтрации по категории)
 * Использует теги для поиска слов, если они есть
 */
export const selectCurrentCollectionWords = createSelector(
  [selectCurrentCollectionData, selectAllWordsInModule, selectCurrentCollectionId],
  (collectionData, allWords, currentCollection) => {
    // Если нет подборки, возвращаем пустой массив
    if (!currentCollection || !collectionData) return [];

    // Пытаемся найти слова по тегам (без фильтрации по категории)
    const taggedWords = getWordsForCollection(allWords, currentCollection);

    // Если нашли слова с тегами, возвращаем их
    if (taggedWords.length > 0) {
      return taggedWords;
    }

    // Fallback: собираем все слова из всех категорий подборки
    const allCollectionWords: Word[] = [];
    Object.values(collectionData.categories).forEach((words) => {
      allCollectionWords.push(...words);
    });
    return allCollectionWords;
  }
);

/**
 * Селектор для слов текущей категории с поддержкой тегов
 * Если категория не выбрана, возвращает все слова подборки
 * Если категория выбрана, фильтрует слова по категории
 */
export const selectCurrentCategoryWords = createSelector(
  [selectCurrentCollectionWords, selectCurrentCategory],
  (collectionWords, currentCategory) => {
    if (!currentCategory) {
      return collectionWords;
    }

    return collectionWords.filter((word) => word.category === currentCategory);
  }
);

// Селектор для слов с учетом подкатегории
export const selectCurrentSubcategoryWords = createSelector(
  [selectCurrentCategoryWords, selectCurrentSubcategory],
  (categoryWords, currentSubcategory) => {
    if (!currentSubcategory) return categoryWords;

    return categoryWords.filter((word) => word.subcategory === currentSubcategory);
  }
);

/**
 * Селектор для получения слов по тегу подборки (для использования в других компонентах)
 */
export const selectWordsByCollectionTag = createSelector(
  [selectAllWordsInModule, (_: RootState, collectionId: string) => collectionId],
  (allWords, collectionId) => getWordsForCollection(allWords, collectionId)
);

// Селектор для получения доступных подкатегорий текущей категории
export const selectAvailableSubcategories = createSelector(
  [selectCurrentCategoryWords, selectCurrentCategory],
  (categoryWords, currentCategory) => {
    if (!currentCategory || categoryWords.length === 0) return [];

    const subcategories = new Set<string>();
    categoryWords.forEach((word) => {
      if (word.subcategory) {
        subcategories.add(word.subcategory);
      }
    });

    return Array.from(subcategories);
  }
);

export const selectIsLoading = (state: RootState) => state.vocabulary.loading === 'loading';

// ============================================
// Reducer
// ============================================
export default vocabularySlice.reducer;

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
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 [selectCurrentCollectionWords] Пересчет:', {
        hasCollectionData: !!collectionData,
        currentCollection,
        allWordsCount: allWords.length,
      });
    }
    
    // Если нет подборки, возвращаем пустой массив
    if (!currentCollection || !collectionData) {
      if (process.env.NODE_ENV === 'development') {
        console.log('⏭️ [selectCurrentCollectionWords] Нет подборки или данных, возвращаем []');
      }
      return [];
    }

    // Пытаемся найти слова по тегам (без фильтрации по категории)
    const taggedWords = getWordsForCollection(allWords, currentCollection);
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [selectCurrentCollectionWords] Слова по тегам:', taggedWords.length);
    }

    // Если нашли слова с тегами, возвращаем их
    if (taggedWords.length > 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [selectCurrentCollectionWords] Возвращаем слова по тегам:', taggedWords.length);
      }
      return taggedWords;
    }

    // Fallback: собираем все слова из всех категорий подборки
    const allCollectionWords: Word[] = [];
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [selectCurrentCollectionWords] Fallback: собираем слова из categories');
      console.log('📋 [selectCurrentCollectionWords] collectionData.categories:', Object.keys(collectionData.categories));
    }
    
    Object.values(collectionData.categories).forEach((words) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('📦 [selectCurrentCollectionWords] Категория содержит:', words.length, 'слов');
      }
      allCollectionWords.push(...words);
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [selectCurrentCollectionWords] Fallback: возвращаем', allCollectionWords.length, 'слов из всех категорий');
    }
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
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 [selectCurrentCategoryWords] Пересчет:', {
        category: currentCategory,
        collectionWordsCount: collectionWords.length,
        firstWord: collectionWords[0] ? { id: collectionWords[0].id, category: collectionWords[0].category } : null,
      });
    }
    
    if (!currentCategory) {
      if (process.env.NODE_ENV === 'development') {
        console.log('⏭️ [selectCurrentCategoryWords] category не установлена, возвращаем все слова подборки');
      }
      return collectionWords;
    }

    const filtered = collectionWords.filter((word) => {
      const matches = word.category === currentCategory;
      if (process.env.NODE_ENV === 'development' && collectionWords.length > 0 && collectionWords.length < 10) {
        console.log(`  🔍 [selectCurrentCategoryWords] Слово "${word.english}" (${word.category}) === ${currentCategory}? ${matches}`);
      }
      return matches;
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [selectCurrentCategoryWords] Отфильтровано:', filtered.length, 'из', collectionWords.length);
      if (filtered.length === 0 && collectionWords.length > 0) {
        console.warn('⚠️ [selectCurrentCategoryWords] ВНИМАНИЕ: После фильтрации 0 слов! Проверьте соответствие категорий.');
        console.warn('  Доступные категории в словах:', [...new Set(collectionWords.map(w => w.category))]);
        console.warn('  Искомая категория:', currentCategory);
      }
    }
    return filtered;
  }
);

// Селектор для слов с учетом подкатегории
export const selectCurrentSubcategoryWords = createSelector(
  [selectCurrentCategoryWords, selectCurrentSubcategory],
  (categoryWords, currentSubcategory) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 [selectCurrentSubcategoryWords] Пересчет для subcategory:', currentSubcategory, 'words count:', categoryWords.length);
    }
    
    if (!currentSubcategory) {
      if (process.env.NODE_ENV === 'development') {
        console.log('⏭️ [selectCurrentSubcategoryWords] subcategory не установлена, возвращаем все слова категории');
      }
      return categoryWords;
    }

    const filtered = categoryWords.filter((word) => word.subcategory === currentSubcategory);
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [selectCurrentSubcategoryWords] Отфильтровано:', filtered.length, 'из', categoryWords.length);
    }
    return filtered;
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

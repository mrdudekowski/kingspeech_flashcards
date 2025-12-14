/**
 * Tests for vocabularySlice
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import vocabularyReducer, {
  setCurrentModule,
  setCurrentCollection,
  setCurrentCategory,
  setCurrentSubcategory,
  resetVocabulary,
} from './vocabularySlice';

type TestStore = ReturnType<typeof configureStore<{ vocabulary: ReturnType<typeof vocabularyReducer> }>>;

describe('vocabularySlice', () => {
  let store: TestStore;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        vocabulary: vocabularyReducer,
      },
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().vocabulary;
      expect(state.currentModule).toBeNull();
      expect(state.currentCollection).toBeNull();
      expect(state.currentCategory).toBeNull();
      expect(state.currentSubcategory).toBeNull();
      expect(state.vocabularyData).toBeNull();
      expect(state.loading).toBe('idle');
      expect(state.error).toBeNull();
    });
  });

  describe('setCurrentModule', () => {
    it('should set current module', () => {
      store.dispatch(setCurrentModule('A1'));
      const state = store.getState().vocabulary;
      expect(state.currentModule).toBe('A1');
    });

    it('should reset collection, category and subcategory when module changes', () => {
      // Сначала устанавливаем все значения
      store.dispatch(setCurrentModule('A1'));
      store.dispatch(setCurrentCollection('food-drink'));
      store.dispatch(setCurrentCategory('nouns'));
      store.dispatch(setCurrentSubcategory('countableNouns'));

      // Меняем модуль
      store.dispatch(setCurrentModule('A2'));

      const state = store.getState().vocabulary;
      expect(state.currentModule).toBe('A2');
      expect(state.currentCollection).toBeNull();
      expect(state.currentCategory).toBeNull();
      expect(state.currentSubcategory).toBeNull();
    });

    it('should accept null to clear module', () => {
      store.dispatch(setCurrentModule('A1'));
      store.dispatch(setCurrentModule(null));
      const state = store.getState().vocabulary;
      expect(state.currentModule).toBeNull();
    });
  });

  describe('setCurrentCollection', () => {
    it('should set current collection', () => {
      store.dispatch(setCurrentCollection('food-drink'));
      const state = store.getState().vocabulary;
      expect(state.currentCollection).toBe('food-drink');
    });

    it('should reset category and subcategory for normal collections', () => {
      store.dispatch(setCurrentCollection('food-drink'));
      store.dispatch(setCurrentCategory('nouns'));
      store.dispatch(setCurrentSubcategory('countableNouns'));

      store.dispatch(setCurrentCollection('travelling'));

      const state = store.getState().vocabulary;
      expect(state.currentCollection).toBe('travelling');
      expect(state.currentCategory).toBeNull();
      expect(state.currentSubcategory).toBeNull();
    });

    it('should NOT reset category and subcategory for irregular-verbs collection', () => {
      store.dispatch(setCurrentCategory('verbs'));
      store.dispatch(setCurrentSubcategory('irregularVerbs'));
      store.dispatch(setCurrentCollection('irregular-verbs'));

      const state = store.getState().vocabulary;
      expect(state.currentCollection).toBe('irregular-verbs');
      expect(state.currentCategory).toBe('verbs');
      expect(state.currentSubcategory).toBe('irregularVerbs');
    });
  });

  describe('setCurrentCategory', () => {
    it('should set current category', () => {
      store.dispatch(setCurrentCategory('verbs'));
      const state = store.getState().vocabulary;
      expect(state.currentCategory).toBe('verbs');
    });

    it('should reset subcategory when category changes', () => {
      store.dispatch(setCurrentCategory('verbs'));
      store.dispatch(setCurrentSubcategory('regularVerbs'));

      store.dispatch(setCurrentCategory('nouns'));

      const state = store.getState().vocabulary;
      expect(state.currentCategory).toBe('nouns');
      expect(state.currentSubcategory).toBeNull();
    });
  });

  describe('setCurrentSubcategory', () => {
    it('should set current subcategory', () => {
      store.dispatch(setCurrentSubcategory('regularVerbs'));
      const state = store.getState().vocabulary;
      expect(state.currentSubcategory).toBe('regularVerbs');
    });

    it('should accept null to clear subcategory', () => {
      store.dispatch(setCurrentSubcategory('regularVerbs'));
      store.dispatch(setCurrentSubcategory(null));
      const state = store.getState().vocabulary;
      expect(state.currentSubcategory).toBeNull();
    });
  });

  describe('resetVocabulary', () => {
    it('should reset all vocabulary state to initial', () => {
      // Устанавливаем значения
      store.dispatch(setCurrentModule('A1'));
      store.dispatch(setCurrentCollection('food-drink'));
      store.dispatch(setCurrentCategory('nouns'));
      store.dispatch(setCurrentSubcategory('countableNouns'));

      // Сбрасываем
      store.dispatch(resetVocabulary());

      const state = store.getState().vocabulary;
      expect(state.currentModule).toBeNull();
      expect(state.currentCollection).toBeNull();
      expect(state.currentCategory).toBeNull();
      expect(state.currentSubcategory).toBeNull();
      expect(state.vocabularyData).toBeNull();
      expect(state.loading).toBe('idle');
      expect(state.error).toBeNull();
    });
  });
});

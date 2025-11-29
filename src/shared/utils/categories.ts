/**
 * Утилиты для работы с категориями и подкатегориями
 */

import { WORD_CATEGORIES, WORD_SUBCATEGORIES, CATEGORY_SUBCATEGORIES_MAP } from '@/app/constants';
import type { WordCategory, WordSubcategory } from '@/app/constants';

/**
 * Получить все подкатегории для категории
 */
export function getSubcategoriesForCategory(category: WordCategory): WordSubcategory[] {
  return CATEGORY_SUBCATEGORIES_MAP[category] || [];
}

/**
 * Проверить, является ли подкатегория валидной для категории
 */
export function isValidSubcategoryForCategory(
  category: WordCategory,
  subcategory: string
): boolean {
  const validSubcategories = getSubcategoriesForCategory(category);
  return validSubcategories.includes(subcategory as WordSubcategory);
}

/**
 * Получить название категории для отображения
 */
export function getCategoryDisplayName(category: WordCategory): string {
  const displayNames: Record<WordCategory, string> = {
    [WORD_CATEGORIES.PHRASES]: 'Phrases',
    [WORD_CATEGORIES.VERBS]: 'Verbs',
    [WORD_CATEGORIES.NOUNS]: 'Nouns',
    [WORD_CATEGORIES.ADJECTIVES]: 'Adjectives',
  };
  return displayNames[category] || category;
}

/**
 * Получить название подкатегории для отображения
 */
export function getSubcategoryDisplayName(subcategory: string): string {
  const displayNames: Record<string, string> = {
    // Verbs
    [WORD_SUBCATEGORIES.REGULAR_VERBS]: 'Regular Verbs',
    [WORD_SUBCATEGORIES.IRREGULAR_VERBS]: 'Irregular Verbs',
    [WORD_SUBCATEGORIES.MODAL_VERBS]: 'Modal Verbs',
    [WORD_SUBCATEGORIES.PHRASAL_VERBS]: 'Phrasal Verbs',
    [WORD_SUBCATEGORIES.AUXILIARY_VERBS]: 'Auxiliary Verbs',
    
    // Nouns
    [WORD_SUBCATEGORIES.COUNTABLE_NOUNS]: 'Countable Nouns',
    [WORD_SUBCATEGORIES.UNCOUNTABLE_NOUNS]: 'Uncountable Nouns',
    [WORD_SUBCATEGORIES.PLURAL_NOUNS]: 'Plural Nouns',
    [WORD_SUBCATEGORIES.PROPER_NOUNS]: 'Proper Nouns',
    [WORD_SUBCATEGORIES.COLLECTIVE_NOUNS]: 'Collective Nouns',
    
    // Phrases
    [WORD_SUBCATEGORIES.IDIOMS]: 'Idioms',
    [WORD_SUBCATEGORIES.COLLOCATIONS]: 'Collocations',
    [WORD_SUBCATEGORIES.EXPRESSIONS]: 'Expressions',
    [WORD_SUBCATEGORIES.PHRASES_COMMON]: 'Common Phrases',
    [WORD_SUBCATEGORIES.PHRASES_FORMAL]: 'Formal Phrases',
    [WORD_SUBCATEGORIES.PHRASES_INFORMAL]: 'Informal Phrases',
    
    // Adjectives
    [WORD_SUBCATEGORIES.DESCRIPTIVE_ADJECTIVES]: 'Descriptive Adjectives',
    [WORD_SUBCATEGORIES.COMPARATIVE_ADJECTIVES]: 'Comparative Adjectives',
    [WORD_SUBCATEGORIES.SUPERLATIVE_ADJECTIVES]: 'Superlative Adjectives',
    [WORD_SUBCATEGORIES.POSSESSIVE_ADJECTIVES]: 'Possessive Adjectives',
  };
  
  return displayNames[subcategory] || subcategory;
}

/**
 * Получить все категории с их подкатегориями (для UI)
 */
export function getCategoriesWithSubcategories(): Array<{
  category: WordCategory;
  categoryName: string;
  subcategories: Array<{
    value: WordSubcategory;
    name: string;
  }>;
}> {
  return Object.values(WORD_CATEGORIES).map((category) => ({
    category,
    categoryName: getCategoryDisplayName(category),
    subcategories: getSubcategoriesForCategory(category).map((sub) => ({
      value: sub,
      name: getSubcategoryDisplayName(sub),
    })),
  }));
}



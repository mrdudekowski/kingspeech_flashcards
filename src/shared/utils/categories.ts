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
    [WORD_CATEGORIES.ADVERBS]: 'Adverbs',
    [WORD_CATEGORIES.PRONOUNS]: 'Pronouns',
    [WORD_CATEGORIES.PREPOSITIONS]: 'Prepositions',
    [WORD_CATEGORIES.CONJUNCTIONS]: 'Conjunctions',
    [WORD_CATEGORIES.INTERJECTIONS]: 'Interjections',
    [WORD_CATEGORIES.ARTICLES]: 'Articles',
    [WORD_CATEGORIES.NUMERALS]: 'Numerals',
    [WORD_CATEGORIES.DETERMINERS]: 'Determiners',
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
    [WORD_SUBCATEGORIES.TRANSITIVE_VERBS]: 'Transitive Verbs',
    [WORD_SUBCATEGORIES.INTRANSITIVE_VERBS]: 'Intransitive Verbs',
    [WORD_SUBCATEGORIES.LINKING_VERBS]: 'Linking Verbs',
    
    // Nouns
    [WORD_SUBCATEGORIES.COUNTABLE_NOUNS]: 'Countable Nouns',
    [WORD_SUBCATEGORIES.UNCOUNTABLE_NOUNS]: 'Uncountable Nouns',
    [WORD_SUBCATEGORIES.PLURAL_NOUNS]: 'Plural Nouns',
    [WORD_SUBCATEGORIES.PROPER_NOUNS]: 'Proper Nouns',
    [WORD_SUBCATEGORIES.COLLECTIVE_NOUNS]: 'Collective Nouns',
    [WORD_SUBCATEGORIES.ABSTRACT_NOUNS]: 'Abstract Nouns',
    [WORD_SUBCATEGORIES.CONCRETE_NOUNS]: 'Concrete Nouns',
    [WORD_SUBCATEGORIES.COMPOUND_NOUNS]: 'Compound Nouns',
    
    // Phrases
    [WORD_SUBCATEGORIES.IDIOMS]: 'Idioms',
    [WORD_SUBCATEGORIES.COLLOCATIONS]: 'Collocations',
    [WORD_SUBCATEGORIES.EXPRESSIONS]: 'Expressions',
    [WORD_SUBCATEGORIES.PHRASES_COMMON]: 'Common Phrases',
    [WORD_SUBCATEGORIES.PHRASES_FORMAL]: 'Formal Phrases',
    [WORD_SUBCATEGORIES.PHRASES_INFORMAL]: 'Informal Phrases',
    [WORD_SUBCATEGORIES.PROVERBS]: 'Proverbs',
    [WORD_SUBCATEGORIES.SAYINGS]: 'Sayings',
    
    // Adjectives
    [WORD_SUBCATEGORIES.DESCRIPTIVE_ADJECTIVES]: 'Descriptive Adjectives',
    [WORD_SUBCATEGORIES.COMPARATIVE_ADJECTIVES]: 'Comparative Adjectives',
    [WORD_SUBCATEGORIES.SUPERLATIVE_ADJECTIVES]: 'Superlative Adjectives',
    [WORD_SUBCATEGORIES.POSSESSIVE_ADJECTIVES]: 'Possessive Adjectives',
    [WORD_SUBCATEGORIES.DEMONSTRATIVE_ADJECTIVES]: 'Demonstrative Adjectives',
    [WORD_SUBCATEGORIES.QUANTITATIVE_ADJECTIVES]: 'Quantitative Adjectives',
    
    // Adverbs
    [WORD_SUBCATEGORIES.ADVERBS_MANNER]: 'Adverbs of Manner',
    [WORD_SUBCATEGORIES.ADVERBS_TIME]: 'Adverbs of Time',
    [WORD_SUBCATEGORIES.ADVERBS_PLACE]: 'Adverbs of Place',
    [WORD_SUBCATEGORIES.ADVERBS_FREQUENCY]: 'Adverbs of Frequency',
    [WORD_SUBCATEGORIES.ADVERBS_DEGREE]: 'Adverbs of Degree',
    
    // Pronouns
    [WORD_SUBCATEGORIES.PERSONAL_PRONOUNS]: 'Personal Pronouns',
    [WORD_SUBCATEGORIES.POSSESSIVE_PRONOUNS]: 'Possessive Pronouns',
    [WORD_SUBCATEGORIES.REFLEXIVE_PRONOUNS]: 'Reflexive Pronouns',
    [WORD_SUBCATEGORIES.DEMONSTRATIVE_PRONOUNS]: 'Demonstrative Pronouns',
    [WORD_SUBCATEGORIES.INTERROGATIVE_PRONOUNS]: 'Interrogative Pronouns',
    [WORD_SUBCATEGORIES.RELATIVE_PRONOUNS]: 'Relative Pronouns',
    [WORD_SUBCATEGORIES.INDEFINITE_PRONOUNS]: 'Indefinite Pronouns',
    
    // Prepositions
    [WORD_SUBCATEGORIES.PREPOSITIONS_TIME]: 'Prepositions of Time',
    [WORD_SUBCATEGORIES.PREPOSITIONS_PLACE]: 'Prepositions of Place',
    [WORD_SUBCATEGORIES.PREPOSITIONS_DIRECTION]: 'Prepositions of Direction',
    [WORD_SUBCATEGORIES.PREPOSITIONS_MANNER]: 'Prepositions of Manner',
    
    // Conjunctions
    [WORD_SUBCATEGORIES.COORDINATING_CONJUNCTIONS]: 'Coordinating Conjunctions',
    [WORD_SUBCATEGORIES.SUBORDINATING_CONJUNCTIONS]: 'Subordinating Conjunctions',
    [WORD_SUBCATEGORIES.CORRELATIVE_CONJUNCTIONS]: 'Correlative Conjunctions',
    
    // Articles
    [WORD_SUBCATEGORIES.DEFINITE_ARTICLE]: 'Definite Article',
    [WORD_SUBCATEGORIES.INDEFINITE_ARTICLE]: 'Indefinite Article',
    
    // Numerals
    [WORD_SUBCATEGORIES.CARDINAL_NUMERALS]: 'Cardinal Numerals',
    [WORD_SUBCATEGORIES.ORDINAL_NUMERALS]: 'Ordinal Numerals',
    [WORD_SUBCATEGORIES.FRACTIONAL_NUMERALS]: 'Fractional Numerals',
    
    // Determiners
    [WORD_SUBCATEGORIES.DEMONSTRATIVE_DETERMINERS]: 'Demonstrative Determiners',
    [WORD_SUBCATEGORIES.POSSESSIVE_DETERMINERS]: 'Possessive Determiners',
    [WORD_SUBCATEGORIES.QUANTIFIERS]: 'Quantifiers',
    [WORD_SUBCATEGORIES.NUMERAL_DETERMINERS]: 'Numeral Determiners',
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



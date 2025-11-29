/**
 * Single Source of Truth - все константы приложения
 * НИКАКИЕ другие файлы не должны содержать константы
 */

// Пути к модулям словаря
export const VOCABULARY_MODULES_PATH = '/data/modules' as const;

// Доступные модули
export const AVAILABLE_MODULES = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type ModuleId = typeof AVAILABLE_MODULES[number];

// Основные категории слов (первый уровень)
export const WORD_CATEGORIES = {
  PHRASES: 'phrases',
  VERBS: 'verbs',
  NOUNS: 'nouns',
  ADJECTIVES: 'adjectives',
} as const;

export type WordCategory = typeof WORD_CATEGORIES[keyof typeof WORD_CATEGORIES];

// Подкатегории слов (второй уровень) - для более тонкой настройки
export const WORD_SUBCATEGORIES = {
  // Подкатегории для Verbs
  REGULAR_VERBS: 'regularVerbs',
  IRREGULAR_VERBS: 'irregularVerbs',
  MODAL_VERBS: 'modalVerbs',
  PHRASAL_VERBS: 'phrasalVerbs',
  AUXILIARY_VERBS: 'auxiliaryVerbs',
  
  // Подкатегории для Nouns
  COUNTABLE_NOUNS: 'countableNouns',
  UNCOUNTABLE_NOUNS: 'uncountableNouns',
  PLURAL_NOUNS: 'pluralNouns',
  PROPER_NOUNS: 'properNouns',
  COLLECTIVE_NOUNS: 'collectiveNouns',
  
  // Подкатегории для Phrases
  IDIOMS: 'idioms',
  COLLOCATIONS: 'collocations',
  EXPRESSIONS: 'expressions',
  PHRASES_COMMON: 'phrasesCommon',
  PHRASES_FORMAL: 'phrasesFormal',
  PHRASES_INFORMAL: 'phrasesInformal',
  
  // Подкатегории для Adjectives
  DESCRIPTIVE_ADJECTIVES: 'descriptiveAdjectives',
  COMPARATIVE_ADJECTIVES: 'comparativeAdjectives',
  SUPERLATIVE_ADJECTIVES: 'superlativeAdjectives',
  POSSESSIVE_ADJECTIVES: 'possessiveAdjectives',
} as const;

export type WordSubcategory = typeof WORD_SUBCATEGORIES[keyof typeof WORD_SUBCATEGORIES];

// Маппинг категорий к их подкатегориям (для валидации и UI)
export const CATEGORY_SUBCATEGORIES_MAP: Record<WordCategory, WordSubcategory[]> = {
  [WORD_CATEGORIES.VERBS]: [
    WORD_SUBCATEGORIES.REGULAR_VERBS,
    WORD_SUBCATEGORIES.IRREGULAR_VERBS,
    WORD_SUBCATEGORIES.MODAL_VERBS,
    WORD_SUBCATEGORIES.PHRASAL_VERBS,
    WORD_SUBCATEGORIES.AUXILIARY_VERBS,
  ],
  [WORD_CATEGORIES.NOUNS]: [
    WORD_SUBCATEGORIES.COUNTABLE_NOUNS,
    WORD_SUBCATEGORIES.UNCOUNTABLE_NOUNS,
    WORD_SUBCATEGORIES.PLURAL_NOUNS,
    WORD_SUBCATEGORIES.PROPER_NOUNS,
    WORD_SUBCATEGORIES.COLLECTIVE_NOUNS,
  ],
  [WORD_CATEGORIES.PHRASES]: [
    WORD_SUBCATEGORIES.IDIOMS,
    WORD_SUBCATEGORIES.COLLOCATIONS,
    WORD_SUBCATEGORIES.EXPRESSIONS,
    WORD_SUBCATEGORIES.PHRASES_COMMON,
    WORD_SUBCATEGORIES.PHRASES_FORMAL,
    WORD_SUBCATEGORIES.PHRASES_INFORMAL,
  ],
  [WORD_CATEGORIES.ADJECTIVES]: [
    WORD_SUBCATEGORIES.DESCRIPTIVE_ADJECTIVES,
    WORD_SUBCATEGORIES.COMPARATIVE_ADJECTIVES,
    WORD_SUBCATEGORIES.SUPERLATIVE_ADJECTIVES,
    WORD_SUBCATEGORIES.POSSESSIVE_ADJECTIVES,
  ],
};

// Типы квизов
export const QUIZ_TYPES = {
  MULTIPLE_CHOICE: 'multipleChoice',
  SPELLING: 'spelling',
} as const;

export type QuizType = typeof QUIZ_TYPES[keyof typeof QUIZ_TYPES];

// LocalStorage ключи
export const STORAGE_KEYS = {
  PROGRESS: 'english-learning-progress',
  SETTINGS: 'english-learning-settings',
} as const;

// Настройки приложения
export const APP_CONFIG = {
  CARDS_PER_SESSION: 20,
  QUIZ_QUESTIONS_COUNT: 10,
  MIN_CORRECT_ANSWERS: 0.7, // 70% для прохождения
} as const;

// Роуты
export const ROUTES = {
  HOME: '/',
  MODULE: '/module/:moduleId',
  COLLECTION: '/module/:moduleId/:collectionId',
  FLASHCARDS: '/flashcards/:moduleId/:collectionId?/:category?/:subcategory?',
  QUIZ: '/quiz/:moduleId/:collectionId?/:category?/:subcategory?',
} as const;


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
// Включает все основные части речи и типы слов в английском языке
export const WORD_CATEGORIES = {
  PHRASES: 'phrases',           // Фразы и выражения
  VERBS: 'verbs',               // Глаголы
  NOUNS: 'nouns',               // Существительные
  ADJECTIVES: 'adjectives',     // Прилагательные
  ADVERBS: 'adverbs',           // Наречия
  PRONOUNS: 'pronouns',         // Местоимения
  PREPOSITIONS: 'prepositions', // Предлоги
  CONJUNCTIONS: 'conjunctions', // Союзы
  INTERJECTIONS: 'interjections', // Междометия
  ARTICLES: 'articles',         // Артикли
  NUMERALS: 'numerals',         // Числительные
  DETERMINERS: 'determiners',   // Определители (this, that, some, any, etc.)
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
  TRANSITIVE_VERBS: 'transitiveVerbs',
  INTRANSITIVE_VERBS: 'intransitiveVerbs',
  LINKING_VERBS: 'linkingVerbs',
  
  // Подкатегории для Nouns
  COUNTABLE_NOUNS: 'countableNouns',
  UNCOUNTABLE_NOUNS: 'uncountableNouns',
  PLURAL_NOUNS: 'pluralNouns',
  PROPER_NOUNS: 'properNouns',
  COLLECTIVE_NOUNS: 'collectiveNouns',
  ABSTRACT_NOUNS: 'abstractNouns',
  CONCRETE_NOUNS: 'concreteNouns',
  COMPOUND_NOUNS: 'compoundNouns',
  
  // Подкатегории для Phrases
  IDIOMS: 'idioms',
  COLLOCATIONS: 'collocations',
  EXPRESSIONS: 'expressions',
  PHRASES_COMMON: 'phrasesCommon',
  PHRASES_FORMAL: 'phrasesFormal',
  PHRASES_INFORMAL: 'phrasesInformal',
  PROVERBS: 'proverbs',
  SAYINGS: 'sayings',
  
  // Подкатегории для Adjectives
  DESCRIPTIVE_ADJECTIVES: 'descriptiveAdjectives',
  COMPARATIVE_ADJECTIVES: 'comparativeAdjectives',
  SUPERLATIVE_ADJECTIVES: 'superlativeAdjectives',
  POSSESSIVE_ADJECTIVES: 'possessiveAdjectives',
  DEMONSTRATIVE_ADJECTIVES: 'demonstrativeAdjectives',
  QUANTITATIVE_ADJECTIVES: 'quantitativeAdjectives',
  
  // Подкатегории для Adverbs
  ADVERBS_MANNER: 'adverbsManner',        // how (quickly, slowly)
  ADVERBS_TIME: 'adverbsTime',           // when (now, yesterday)
  ADVERBS_PLACE: 'adverbsPlace',          // where (here, there)
  ADVERBS_FREQUENCY: 'adverbsFrequency',  // how often (always, never)
  ADVERBS_DEGREE: 'adverbsDegree',        // how much (very, quite)
  
  // Подкатегории для Pronouns
  PERSONAL_PRONOUNS: 'personalPronouns',     // I, you, he, she
  POSSESSIVE_PRONOUNS: 'possessivePronouns', // mine, yours, his
  REFLEXIVE_PRONOUNS: 'reflexivePronouns',   // myself, yourself
  DEMONSTRATIVE_PRONOUNS: 'demonstrativePronouns', // this, that
  INTERROGATIVE_PRONOUNS: 'interrogativePronouns', // who, what, which
  RELATIVE_PRONOUNS: 'relativePronouns',     // who, which, that
  INDEFINITE_PRONOUNS: 'indefinitePronouns', // some, any, all
  
  // Подкатегории для Prepositions
  PREPOSITIONS_TIME: 'prepositionsTime',     // at, on, in
  PREPOSITIONS_PLACE: 'prepositionsPlace',   // at, on, in, under
  PREPOSITIONS_DIRECTION: 'prepositionsDirection', // to, from, towards
  PREPOSITIONS_MANNER: 'prepositionsManner', // by, with
  
  // Подкатегории для Conjunctions
  COORDINATING_CONJUNCTIONS: 'coordinatingConjunctions', // and, but, or
  SUBORDINATING_CONJUNCTIONS: 'subordinatingConjunctions', // because, although
  CORRELATIVE_CONJUNCTIONS: 'correlativeConjunctions', // both...and, either...or
  
  // Подкатегории для Articles
  DEFINITE_ARTICLE: 'definiteArticle',   // the
  INDEFINITE_ARTICLE: 'indefiniteArticle', // a, an
  
  // Подкатегории для Numerals
  CARDINAL_NUMERALS: 'cardinalNumerals',   // one, two, three
  ORDINAL_NUMERALS: 'ordinalNumerals',     // first, second, third
  FRACTIONAL_NUMERALS: 'fractionalNumerals', // half, quarter
  
  // Подкатегории для Determiners
  DEMONSTRATIVE_DETERMINERS: 'demonstrativeDeterminers', // this, that, these, those
  POSSESSIVE_DETERMINERS: 'possessiveDeterminers',      // my, your, his
  QUANTIFIERS: 'quantifiers',                           // some, any, many, much
  NUMERAL_DETERMINERS: 'numeralDeterminers',            // one, two, first
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
    WORD_SUBCATEGORIES.TRANSITIVE_VERBS,
    WORD_SUBCATEGORIES.INTRANSITIVE_VERBS,
    WORD_SUBCATEGORIES.LINKING_VERBS,
  ],
  [WORD_CATEGORIES.NOUNS]: [
    WORD_SUBCATEGORIES.COUNTABLE_NOUNS,
    WORD_SUBCATEGORIES.UNCOUNTABLE_NOUNS,
    WORD_SUBCATEGORIES.PLURAL_NOUNS,
    WORD_SUBCATEGORIES.PROPER_NOUNS,
    WORD_SUBCATEGORIES.COLLECTIVE_NOUNS,
    WORD_SUBCATEGORIES.ABSTRACT_NOUNS,
    WORD_SUBCATEGORIES.CONCRETE_NOUNS,
    WORD_SUBCATEGORIES.COMPOUND_NOUNS,
  ],
  [WORD_CATEGORIES.PHRASES]: [
    WORD_SUBCATEGORIES.IDIOMS,
    WORD_SUBCATEGORIES.COLLOCATIONS,
    WORD_SUBCATEGORIES.EXPRESSIONS,
    WORD_SUBCATEGORIES.PHRASES_COMMON,
    WORD_SUBCATEGORIES.PHRASES_FORMAL,
    WORD_SUBCATEGORIES.PHRASES_INFORMAL,
    WORD_SUBCATEGORIES.PROVERBS,
    WORD_SUBCATEGORIES.SAYINGS,
  ],
  [WORD_CATEGORIES.ADJECTIVES]: [
    WORD_SUBCATEGORIES.DESCRIPTIVE_ADJECTIVES,
    WORD_SUBCATEGORIES.COMPARATIVE_ADJECTIVES,
    WORD_SUBCATEGORIES.SUPERLATIVE_ADJECTIVES,
    WORD_SUBCATEGORIES.POSSESSIVE_ADJECTIVES,
    WORD_SUBCATEGORIES.DEMONSTRATIVE_ADJECTIVES,
    WORD_SUBCATEGORIES.QUANTITATIVE_ADJECTIVES,
  ],
  [WORD_CATEGORIES.ADVERBS]: [
    WORD_SUBCATEGORIES.ADVERBS_MANNER,
    WORD_SUBCATEGORIES.ADVERBS_TIME,
    WORD_SUBCATEGORIES.ADVERBS_PLACE,
    WORD_SUBCATEGORIES.ADVERBS_FREQUENCY,
    WORD_SUBCATEGORIES.ADVERBS_DEGREE,
  ],
  [WORD_CATEGORIES.PRONOUNS]: [
    WORD_SUBCATEGORIES.PERSONAL_PRONOUNS,
    WORD_SUBCATEGORIES.POSSESSIVE_PRONOUNS,
    WORD_SUBCATEGORIES.REFLEXIVE_PRONOUNS,
    WORD_SUBCATEGORIES.DEMONSTRATIVE_PRONOUNS,
    WORD_SUBCATEGORIES.INTERROGATIVE_PRONOUNS,
    WORD_SUBCATEGORIES.RELATIVE_PRONOUNS,
    WORD_SUBCATEGORIES.INDEFINITE_PRONOUNS,
  ],
  [WORD_CATEGORIES.PREPOSITIONS]: [
    WORD_SUBCATEGORIES.PREPOSITIONS_TIME,
    WORD_SUBCATEGORIES.PREPOSITIONS_PLACE,
    WORD_SUBCATEGORIES.PREPOSITIONS_DIRECTION,
    WORD_SUBCATEGORIES.PREPOSITIONS_MANNER,
  ],
  [WORD_CATEGORIES.CONJUNCTIONS]: [
    WORD_SUBCATEGORIES.COORDINATING_CONJUNCTIONS,
    WORD_SUBCATEGORIES.SUBORDINATING_CONJUNCTIONS,
    WORD_SUBCATEGORIES.CORRELATIVE_CONJUNCTIONS,
  ],
  [WORD_CATEGORIES.INTERJECTIONS]: [], // Междометия обычно не имеют подкатегорий
  [WORD_CATEGORIES.ARTICLES]: [
    WORD_SUBCATEGORIES.DEFINITE_ARTICLE,
    WORD_SUBCATEGORIES.INDEFINITE_ARTICLE,
  ],
  [WORD_CATEGORIES.NUMERALS]: [
    WORD_SUBCATEGORIES.CARDINAL_NUMERALS,
    WORD_SUBCATEGORIES.ORDINAL_NUMERALS,
    WORD_SUBCATEGORIES.FRACTIONAL_NUMERALS,
  ],
  [WORD_CATEGORIES.DETERMINERS]: [
    WORD_SUBCATEGORIES.DEMONSTRATIVE_DETERMINERS,
    WORD_SUBCATEGORIES.POSSESSIVE_DETERMINERS,
    WORD_SUBCATEGORIES.QUANTIFIERS,
    WORD_SUBCATEGORIES.NUMERAL_DETERMINERS,
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
  THEME: 'english-learning-theme',
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


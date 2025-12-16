import type { Icon } from '@phosphor-icons/react';
import {
  User,
  ArrowRight,
  HandHeart,
  IdentificationBadge,
  HandPointing,
  Question,
  ArrowsOutCardinal,
  LinkSimpleHorizontal,
  TextAa,
  Sparkle,
  Lightning,
  Plus,
  ClockCounterClockwise,
  MapPin,
  Clock,
} from '@phosphor-icons/react';

/**
 * Метаданные грамматических категорий.
 *
 * Single Source of Truth для:
 * - человеко‑читаемых английских названий категорий
 * - русских названий категорий
 * - иконок (Phosphor Icons)
 */
export interface CategoryMeta {
  /** Ключ категории / подкатегории из JSON (category или subcategory). */
  id: string;
  /** Группа верхнего уровня (pronouns, prepositions, ...). */
  group: 'Pronouns' | 'Prepositions' | 'Conjunctions' | 'Articles' | 'Adverbs';
  /** Уровень: основная категория или подкатегория. */
  level: 'category' | 'subcategory';
  /** Английское человеко‑читаемое название. */
  labelEn: string;
  /** Русский перевод названия категории. */
  labelRu: string;
  /** Компонент иконки Phosphor для использования в React. */
  icon: Icon;
}

export const CATEGORY_META_LIST: CategoryMeta[] = [
  // PRONOUNS (используем только подкатегории, без общего Pronouns)
  {
    group: 'Pronouns',
    id: 'personalPronouns',
    level: 'subcategory',
    icon: User,
    labelEn: 'Personal pronouns',
    labelRu: 'Личные местоимения',
  },
  {
    group: 'Pronouns',
    id: 'objectPronouns',
    level: 'subcategory',
    icon: ArrowRight,
    labelEn: 'Object pronouns',
    labelRu: 'Объектные местоимения',
  },
  {
    group: 'Pronouns',
    id: 'possessiveAdjectives',
    level: 'subcategory',
    icon: HandHeart,
    labelEn: 'Possessive adjectives',
    labelRu: 'Притяжательные прилагательные',
  },
  {
    group: 'Pronouns',
    id: 'possessivePronouns',
    level: 'subcategory',
    icon: IdentificationBadge,
    labelEn: 'Possessive pronouns',
    labelRu: 'Притяжательные местоимения',
  },
  {
    group: 'Pronouns',
    id: 'demonstrativePronouns',
    level: 'subcategory',
    icon: HandPointing,
    labelEn: 'Demonstrative pronouns',
    labelRu: 'Указательные местоимения',
  },
  {
    group: 'Pronouns',
    id: 'interrogativePronouns',
    level: 'subcategory',
    icon: Question,
    labelEn: 'Interrogative pronouns',
    labelRu: 'Вопросительные местоимения',
  },

  // PREPOSITIONS
  {
    group: 'Prepositions',
    id: 'prepositions',
    level: 'category',
    icon: ArrowsOutCardinal,
    labelEn: 'Prepositions',
    labelRu: 'Предлоги',
  },

  // CONJUNCTIONS
  {
    group: 'Conjunctions',
    id: 'conjunctions',
    level: 'category',
    icon: LinkSimpleHorizontal,
    labelEn: 'Conjunctions',
    labelRu: 'Союзы',
  },

  // ARTICLES
  {
    group: 'Articles',
    id: 'articles',
    level: 'category',
    icon: TextAa,
    labelEn: 'Articles',
    labelRu: 'Артикли',
  },

  // ADVERBS
  {
    group: 'Adverbs',
    id: 'adverbs',
    level: 'category',
    icon: Sparkle,
    labelEn: 'Adverbs (general)',
    labelRu: 'Наречия (общая группа)',
  },
  {
    group: 'Adverbs',
    id: 'intensifiers',
    level: 'subcategory',
    icon: Lightning,
    labelEn: 'Intensifiers',
    labelRu: 'Усилительные наречия',
  },
  {
    group: 'Adverbs',
    id: 'additive',
    level: 'subcategory',
    icon: Plus,
    labelEn: 'Additive adverbs',
    labelRu: 'Добавочные наречия',
  },
  {
    group: 'Adverbs',
    id: 'frequency',
    level: 'subcategory',
    icon: ClockCounterClockwise,
    labelEn: 'Adverbs of frequency',
    labelRu: 'Наречия частоты',
  },
  {
    group: 'Adverbs',
    id: 'place',
    level: 'subcategory',
    icon: MapPin,
    labelEn: 'Adverbs of place',
    labelRu: 'Наречия места',
  },
  {
    group: 'Adverbs',
    id: 'time',
    level: 'subcategory',
    icon: Clock,
    labelEn: 'Adverbs of time',
    labelRu: 'Наречия времени',
  },
];

/** Быстрый доступ по ключу категории. */
export const CATEGORY_META_BY_ID: Record<string, CategoryMeta> = CATEGORY_META_LIST.reduce(
  (acc, meta) => {
    acc[meta.id] = meta;
    return acc;
  },
  {} as Record<string, CategoryMeta>,
);

/**
 * Вспомогательная функция: вернуть метаданные категории по `category` / `subcategory`.
 * Если указан subcategory — он приоритетнее.
 */
export function resolveCategoryMeta(params: {
  category?: string | null;
  subcategory?: string | null;
}): CategoryMeta | null {
  const key = params.subcategory || params.category || undefined;
  if (!key) return null;
  return CATEGORY_META_BY_ID[key] ?? null;
}

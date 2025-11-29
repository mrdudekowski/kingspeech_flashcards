/**
 * Утилиты для работы с тегами слов
 * Позволяют фильтровать слова по тегам для множественных связей с подборками
 */

import type { Word } from '@/shared/types';

/**
 * Проверить, имеет ли слово тег
 */
export function hasTag(word: Word, tag: string): boolean {
  return word.tags?.includes(tag) ?? false;
}

/**
 * Проверить, имеет ли слово хотя бы один из тегов
 */
export function hasAnyTag(word: Word, tags: string[]): boolean {
  if (!word.tags || word.tags.length === 0) return false;
  return tags.some((tag) => word.tags!.includes(tag));
}

/**
 * Проверить, имеет ли слово все указанные теги
 */
export function hasAllTags(word: Word, tags: string[]): boolean {
  if (!word.tags || word.tags.length === 0) return false;
  return tags.every((tag) => word.tags!.includes(tag));
}

/**
 * Фильтровать слова по тегу
 */
export function filterWordsByTag(words: Word[], tag: string): Word[] {
  return words.filter((word) => hasTag(word, tag));
}

/**
 * Фильтровать слова по нескольким тегам (OR логика - хотя бы один тег)
 */
export function filterWordsByAnyTag(words: Word[], tags: string[]): Word[] {
  return words.filter((word) => hasAnyTag(word, tags));
}

/**
 * Фильтровать слова по нескольким тегам (AND логика - все теги)
 */
export function filterWordsByAllTags(words: Word[], tags: string[]): Word[] {
  return words.filter((word) => hasAllTags(word, tags));
}

/**
 * Получить все уникальные теги из массива слов
 */
export function getAllTagsFromWords(words: Word[]): string[] {
  const tagsSet = new Set<string>();
  words.forEach((word) => {
    word.tags?.forEach((tag) => tagsSet.add(tag));
  });
  return Array.from(tagsSet).sort();
}

/**
 * Получить слова, которые должны отображаться в подборке
 * Использует теги, если они есть, иначе использует прямую связь через категории
 */
export function getWordsForCollection(
  allWords: Word[],
  collectionId: string,
  category?: string
): Word[] {
  // Фильтруем слова по тегу подборки
  const taggedWords = filterWordsByTag(allWords, collectionId);
  
  // Если указана категория, дополнительно фильтруем по ней
  if (category) {
    return taggedWords.filter((word) => word.category === category);
  }
  
  return taggedWords;
}


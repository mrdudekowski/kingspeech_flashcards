/**
 * Quiz Generator
 * Генератор вопросов для квизов
 */

import type { Word } from '@/shared/types';
import type { QuizType } from '@/app/constants';
import type { QuizQuestion, QuizSettings } from '../types';
import { log } from '@/shared/utils';

/**
 * Перемешать массив (Fisher-Yates shuffle)
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Выбрать случайные элементы из массива
 */
function selectRandom<T>(array: T[], count: number): T[] {
  const shuffled = shuffle(array);
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Генерировать отвлекающие варианты (неправильные ответы)
 * @param correctAnswer - правильный ответ
 * @param allWords - все доступные слова
 * @param count - количество вариантов
 */
function generateDistractors(
  correctAnswer: string,
  allWords: Word[],
  count: number = 3
): string[] {
  // Фильтруем слова, исключая правильный ответ
  const otherWords = allWords.filter(
    (w) => w.translation.toLowerCase() !== correctAnswer.toLowerCase()
  );

  // Выбираем случайные переводы
  const distractors = selectRandom(otherWords, count).map((w) => w.translation);

  return distractors;
}

/**
 * Генерировать вопросы типа Multiple Choice
 */
export function generateMultipleChoiceQuestions(
  words: Word[],
  allWords: Word[],
  settings: QuizSettings
): QuizQuestion[] {
  log.debug('QuizGenerator', 'Генерация Multiple Choice вопросов', {
    wordsCount: words.length,
    questionCount: settings.questionCount,
  });

  // Выбираем случайные слова для вопросов
  const selectedWords = settings.shuffleQuestions
    ? selectRandom(words, settings.questionCount)
    : words.slice(0, settings.questionCount);

  const questions: QuizQuestion[] = selectedWords.map((word, index) => {
    const correctAnswer = word.translation;

    // Генерируем 3 неправильных варианта
    const distractors = generateDistractors(correctAnswer, allWords, 3);

    // Объединяем правильный ответ с неправильными
    let options = [correctAnswer, ...distractors];

    // Перемешиваем варианты, если включено в настройках
    if (settings.shuffleOptions) {
      options = shuffle(options);
    }

    return {
      id: `question-${word.id}-${index}`,
      word,
      correctAnswer,
      options,
    };
  });

  log.info('QuizGenerator', 'Multiple Choice вопросы сгенерированы', {
    count: questions.length,
  });

  return questions;
}

/**
 * Генерировать вопросы типа True/False
 */
export function generateTrueFalseQuestions(
  words: Word[],
  allWords: Word[],
  settings: QuizSettings
): QuizQuestion[] {
  log.debug('QuizGenerator', 'Генерация True/False вопросов', {
    wordsCount: words.length,
  });

  const selectedWords = settings.shuffleQuestions
    ? selectRandom(words, settings.questionCount)
    : words.slice(0, settings.questionCount);

  const questions: QuizQuestion[] = selectedWords.map((word, index) => {
    // Случайно решаем: показать правильный или неправильный перевод
    const showCorrect = Math.random() > 0.5;

    let displayedTranslation: string;
    let correctAnswer: string;

    if (showCorrect) {
      displayedTranslation = word.translation;
      correctAnswer = 'true';
    } else {
      // Выбираем случайный неправильный перевод
      const wrongWord = selectRandom(
        allWords.filter((w) => w.id !== word.id),
        1
      )[0];
      displayedTranslation = wrongWord.translation;
      correctAnswer = 'false';
    }

    // Создаем модифицированное слово для отображения
    const questionWord: Word = {
      ...word,
      translation: displayedTranslation,
    };

    return {
      id: `question-${word.id}-${index}`,
      word: questionWord,
      correctAnswer,
      options: ['true', 'false'],
    };
  });

  log.info('QuizGenerator', 'True/False вопросы сгенерированы', {
    count: questions.length,
  });

  return questions;
}

/**
 * Генерировать вопросы типа Matching (сопоставление пар)
 * Возвращает пары слов для сопоставления
 */
export function generateMatchingQuestions(
  words: Word[],
  settings: QuizSettings
): QuizQuestion[] {
  log.debug('QuizGenerator', 'Генерация Matching вопросов', {
    wordsCount: words.length,
  });

  // Для matching нужно минимум 4 пары
  const pairCount = Math.min(settings.questionCount, words.length);
  const selectedWords = settings.shuffleQuestions
    ? selectRandom(words, pairCount)
    : words.slice(0, pairCount);

  // Создаем пары: английское слово -> русский перевод
  const translations = settings.shuffleOptions
    ? shuffle(selectedWords.map((w) => w.translation))
    : selectedWords.map((w) => w.translation);

  const questions: QuizQuestion[] = selectedWords.map((word, index) => ({
    id: `question-${word.id}-${index}`,
    word,
    correctAnswer: word.translation,
    options: translations, // Все переводы для выбора
  }));

  log.info('QuizGenerator', 'Matching вопросы сгенерированы', {
    count: questions.length,
  });

  return questions;
}

/**
 * Генерировать вопросы типа Fill in the Blank (заполнить пропуск)
 */
export function generateFillInTheBlankQuestions(
  words: Word[],
  settings: QuizSettings
): QuizQuestion[] {
  log.debug('QuizGenerator', 'Генерация Fill in the Blank вопросов', {
    wordsCount: words.length,
  });

  const selectedWords = settings.shuffleQuestions
    ? selectRandom(words, settings.questionCount)
    : words.slice(0, settings.questionCount);

  const questions: QuizQuestion[] = selectedWords
    .filter((word) => word.example) // Только слова с примерами
    .map((word, index) => {
      if (!word.example) return null;

      // Заменяем слово в примере на пропуск
      const blankExample = word.example.replace(
        new RegExp(word.english, 'gi'),
        '_____'
      );

      // Создаем модифицированное слово с пропуском
      const questionWord: Word = {
        ...word,
        example: blankExample,
      };

      return {
        id: `question-${word.id}-${index}`,
        word: questionWord,
        correctAnswer: word.english.toLowerCase(),
      };
    })
    .filter((q): q is QuizQuestion => q !== null);

  log.info('QuizGenerator', 'Fill in the Blank вопросы сгенерированы', {
    count: questions.length,
  });

  return questions;
}

/**
 * Главная функция генерации вопросов
 */
export function generateQuestions(
  type: QuizType,
  words: Word[],
  allWords: Word[],
  settings: QuizSettings
): QuizQuestion[] {
  log.info('QuizGenerator', 'Начало генерации вопросов', {
    type,
    wordsCount: words.length,
    settings,
  });

  if (words.length === 0) {
    log.warn('QuizGenerator', 'Нет слов для генерации вопросов');
    return [];
  }

  let questions: QuizQuestion[];

  switch (type) {
    case 'multipleChoice':
      questions = generateMultipleChoiceQuestions(words, allWords, settings);
      break;

    case 'trueFalse':
      questions = generateTrueFalseQuestions(words, allWords, settings);
      break;

    case 'matching':
      questions = generateMatchingQuestions(words, settings);
      break;

    case 'fillInTheBlank':
      questions = generateFillInTheBlankQuestions(words, settings);
      break;

    case 'listening':
      // TODO: Реализовать когда будет аудио
      log.warn('QuizGenerator', 'Listening quiz не реализован');
      questions = [];
      break;

    default:
      log.error('QuizGenerator', `Неизвестный тип квиза: ${type}`);
      questions = [];
  }

  log.info('QuizGenerator', 'Генерация вопросов завершена', {
    type,
    generatedCount: questions.length,
  });

  return questions;
}

/**
 * Проверить ответ пользователя
 */
export function checkAnswer(
  question: QuizQuestion,
  userAnswer: string
): boolean {
  const normalizedUserAnswer = userAnswer.trim().toLowerCase();
  const normalizedCorrectAnswer = question.correctAnswer.trim().toLowerCase();

  return normalizedUserAnswer === normalizedCorrectAnswer;
}

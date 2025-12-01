/**
 * Flashcard - компонент карточки для изучения слов
 * Поддерживает переворот с анимацией
 */

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/shared/hooks/redux';
import {
  flipCard,
  toggleSpotlight,
  selectCurrentCard,
  selectIsFlipped,
  selectDisplayMode,
  selectCurrentWordStatus,
  selectIsReviewingCard,
  selectSpotlightActive,
} from './flashcardsSlice';
import { selectCurrentSubcategory } from '@/features/vocabulary/vocabularySlice';
import { WORD_SUBCATEGORIES } from '@/app/constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';

function Flashcard() {
  const dispatch = useAppDispatch();
  const currentCard = useAppSelector(selectCurrentCard);
  const isFlipped = useAppSelector(selectIsFlipped);
  const displayMode = useAppSelector(selectDisplayMode);
  const wordStatus = useAppSelector(selectCurrentWordStatus);
  const isReviewingCard = useAppSelector(selectIsReviewingCard);
  const currentSubcategory = useAppSelector(selectCurrentSubcategory);
  const spotlightActive = useAppSelector(selectSpotlightActive);
  const showEnglishOnFront = displayMode === 'english-first';
  
  // Состояние для анимации исчезновения буквы
  const [showLetter, setShowLetter] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  // Управление показом буквы с анимацией
  useEffect(() => {
    if (spotlightActive) {
      setShowLetter(true);
      setIsAnimatingOut(false);
    } else {
      // Запускаем анимацию исчезновения
      setIsAnimatingOut(true);
      const timer = setTimeout(() => {
        setShowLetter(false);
        setIsAnimatingOut(false);
      }, 300); // Время анимации исчезновения
      return () => clearTimeout(timer);
    }
  }, [spotlightActive]);

  // Получаем полное слово ответа (слова, которое НЕ видно на текущей стороне)
  const getAnswerWord = (): string => {
    if (!currentCard) return '';
    // Ответ - это слово на противоположной стороне от той, что видна сейчас
    let answer: string;
    if (isFlipped) {
      // Если карточка перевернута, показываем букву с лицевой стороны (той, что была видна до переворота)
      answer = showEnglishOnFront ? currentCard.english : currentCard.translation;
    } else {
      // Если карточка не перевернута, показываем букву с обратной стороны (той, что будет видна после переворота)
      answer = showEnglishOnFront ? currentCard.translation : currentCard.english;
    }
    return answer || '';
  };

  // Рендеринг подсказки с первой буквой и подчеркиваниями
  const renderSpotlightHint = (): JSX.Element => {
    const answerWord = getAnswerWord();
    if (!answerWord || answerWord.length === 0) {
      return <></>;
    }

    const firstLetter = answerWord[0].toLowerCase();
    const remainingLetters = answerWord.length - 1;
    // Создаем подчеркивания с пробелами между ними: "_ _ _"
    const underscores = remainingLetters > 0 ? '_ '.repeat(remainingLetters).trim() : '';

    return (
      <span className="text-[1.575rem] font-bold text-yellow-400 dark:text-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] animate-levitation">
        {firstLetter}
        {remainingLetters > 0 && (
          <span className="text-yellow-400 dark:text-yellow-300 opacity-70">
            {underscores}
          </span>
        )}
      </span>
    );
  };

  const handleSpotlightClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем переворот карточки при клике на кнопку
    dispatch(toggleSpotlight());
  };

  const handleFlip = () => {
    dispatch(flipCard());
  };

  // Определяем, какую плашку показывать
  const getStatusBadge = () => {
    if (isReviewingCard) {
      return { text: 'Изучается', color: 'bg-orange-500' };
    }
    if (wordStatus === 'studied') {
      return { text: 'Изучено', color: 'bg-green-500' };
    }
    if (wordStatus === 'difficult') {
      return { text: 'Сложное слово', color: 'bg-purple-500' };
    }
    return null;
  };

  const statusBadge = getStatusBadge();

  // Проверяем, является ли карточка неправильным глаголом
  const isIrregularVerb = currentCard?.subcategory === WORD_SUBCATEGORIES.IRREGULAR_VERBS;
  // Формы показываем только если пользователь находится в категории Irregular Verbs
  const isInIrregularVerbsCategory = currentSubcategory === WORD_SUBCATEGORIES.IRREGULAR_VERBS;
  const hasIrregularForms = isIrregularVerb && currentCard?.irregularForms && isInIrregularVerbsCategory;

  if (!currentCard) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500 dark:text-gray-400">Нет карточек для изучения</p>
      </div>
    );
  }

  return (
    <div className="perspective-1000">
      <div
        className={`relative w-full h-96 transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${
          isFlipped ? 'rotate-x-180' : ''
        }`}
        onClick={handleFlip}
      >
        {/* Лицевая сторона */}
        <div
          className={`absolute inset-0 backface-hidden glass-strong rounded-2xl p-8 shadow-xl flex flex-col items-center justify-center ${
            isFlipped ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {/* Плашка статуса */}
          {statusBadge && (
            <div className={`absolute top-4 right-4 ${statusBadge.color} text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md`}>
              {statusBadge.text}
            </div>
          )}
          {/* Кнопка spotlight и буква-подсказка */}
          <div className="absolute top-4 left-4 flex items-center gap-3">
            <button
              onClick={handleSpotlightClick}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${
                spotlightActive
                  ? 'bg-yellow-400 dark:bg-yellow-500 text-yellow-900 dark:text-yellow-950 shadow-lg shadow-yellow-400/50'
                  : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-slate-600'
              }`}
              title="Подсказка: показать первую букву ответа"
            >
              <FontAwesomeIcon icon={faLightbulb} className="w-5 h-5" />
            </button>
            {/* Буква-подсказка с анимацией */}
            {showLetter && (
              <div className={`spotlight-letter ${isAnimatingOut ? 'animate-spotlight-out' : 'animate-spotlight-in'}`}>
                {renderSpotlightHint()}
              </div>
            )}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {showEnglishOnFront ? 'Английский' : 'Перевод'}
            </p>
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              {showEnglishOnFront ? currentCard.english : currentCard.translation}
            </h2>
            {/* Для неправильных глаголов на front side показываем только первую форму (без дополнительных форм) */}
            {showEnglishOnFront && !isIrregularVerb && currentCard.definition && (
              <p className="text-lg text-gray-600 dark:text-gray-300 italic">
                {currentCard.definition}
              </p>
            )}
            {!showEnglishOnFront && currentCard.example && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Пример:</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 italic">
                  {currentCard.example}
                </p>
              </div>
            )}
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-6">
              Нажмите, чтобы перевернуть
            </p>
          </div>
        </div>

        {/* Обратная сторона */}
        <div
          className={`absolute inset-0 backface-hidden glass-strong rounded-2xl p-8 shadow-xl flex flex-col items-center justify-center rotate-x-180 ${
            isFlipped ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Плашка статуса */}
          {statusBadge && (
            <div className={`absolute top-4 right-4 ${statusBadge.color} text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md`}>
              {statusBadge.text}
            </div>
          )}
          {/* Кнопка spotlight и буква-подсказка */}
          <div className="absolute top-4 left-4 flex items-center gap-3">
            <button
              onClick={handleSpotlightClick}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${
                spotlightActive
                  ? 'bg-yellow-400 dark:bg-yellow-500 text-yellow-900 dark:text-yellow-950 shadow-lg shadow-yellow-400/50'
                  : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-slate-600'
              }`}
              title="Подсказка: показать первую букву ответа"
            >
              <FontAwesomeIcon icon={faLightbulb} className="w-5 h-5" />
            </button>
            {/* Буква-подсказка с анимацией */}
            {showLetter && (
              <div className={`spotlight-letter ${isAnimatingOut ? 'animate-spotlight-out' : 'animate-spotlight-in'}`}>
                {renderSpotlightHint()}
              </div>
            )}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {showEnglishOnFront ? 'Перевод' : 'Английский'}
            </p>
            <h2 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4">
              {showEnglishOnFront ? currentCard.translation : currentCard.english}
            </h2>
            {/* Для неправильных глаголов показываем вторую и третью формы на back side */}
            {hasIrregularForms && (
              <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg border-2 border-orange-200 dark:border-orange-700">
                <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                  {currentCard.irregularForms!.past} - {currentCard.irregularForms!.pastParticiple}
                </p>
              </div>
            )}
            {!showEnglishOnFront && !isIrregularVerb && currentCard.definition && (
              <p className="text-lg text-gray-600 dark:text-gray-300 italic text-center">
                {currentCard.definition}
              </p>
            )}
            {showEnglishOnFront && !isIrregularVerb && currentCard.example && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Пример:</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 italic">
                  {currentCard.example}
                </p>
              </div>
            )}
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-6">
              Нажмите, чтобы перевернуть
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Flashcard;


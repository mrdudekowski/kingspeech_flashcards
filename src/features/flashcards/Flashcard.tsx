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
import { WORD_SUBCATEGORIES } from '@/app/constants';
import { resolveCategoryMeta } from '@/app/categoryMeta';
import CategoryIconButton from '@/shared/components/CategoryIconButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb, faQuoteLeft } from '@fortawesome/free-solid-svg-icons';

interface IrregularVerbFormProps {
  formType: 'past' | 'pastParticiple';
  value: string;
  title: string;
}

function IrregularVerbForm({ value, title }: IrregularVerbFormProps) {
  return (
    <div className="glass flex flex-col items-center justify-center px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105">
      <span className="text-xs font-semibold tracking-wide uppercase text-gray-600 dark:text-gray-400 mb-1">
        {title}
      </span>
      <span className="text-xl font-bold text-gray-800 dark:text-gray-100">
        {value}
      </span>
    </div>
  );
}

function Flashcard() {
  const dispatch = useAppDispatch();
  const currentCard = useAppSelector(selectCurrentCard);
  const isFlipped = useAppSelector(selectIsFlipped);
  const displayMode = useAppSelector(selectDisplayMode);
  const wordStatus = useAppSelector(selectCurrentWordStatus);
  const isReviewingCard = useAppSelector(selectIsReviewingCard);
  const spotlightActive = useAppSelector(selectSpotlightActive);
  const showEnglishOnFront = displayMode === 'english-first';
  
  // Состояние для анимации исчезновения буквы
  const [showLetter, setShowLetter] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  
  // Состояние для показа примера
  const [showExample, setShowExample] = useState(false);

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

    // Обрабатываем каждый символ: буквы заменяем на подчеркивания (кроме первой), 
    // запятые оставляем, точки заменяем на подчеркивания, пробелы удваиваем
    let result = '';
    let isFirstLetter = true;
    
    for (let i = 0; i < answerWord.length; i++) {
      const char = answerWord[i];
      
      // Проверяем, является ли символ буквой (латиница или кириллица)
      const isLetter = /[a-zA-Zа-яА-ЯёЁ]/.test(char);
      
      if (isLetter) {
        if (isFirstLetter) {
          // Первая буква показывается
          result += char.toLowerCase();
          isFirstLetter = false;
        } else {
          // Остальные буквы заменяем на подчеркивание (без пробела)
          result += '_';
        }
      } else if (char === ' ') {
        // Пробел заменяем на два пробела
        result += '  ';
        // После пробела следующая буква будет первой в новом слове
        isFirstLetter = true;
      } else if (char === ',') {
        // Запятые оставляем как есть
        result += char;
        // После запятой следующая буква будет первой в новом слове
        isFirstLetter = true;
      } else if (char === '.') {
        // Точки заменяем на подчеркивания
        result += '_';
        // После точки следующая буква будет первой в новом слове
        isFirstLetter = true;
      } else {
        // Остальные знаки препинания заменяем на подчеркивания
        result += '_';
        // После знака препинания следующая буква будет первой в новом слове
        isFirstLetter = true;
      }
    }

    const firstChar = result[0] || '';
    const remaining = result.slice(1);

    return (
      <span className="text-[1.575rem] font-bold text-yellow-400 dark:text-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] animate-levitation whitespace-pre">
        {firstChar}
        {remaining && (
          <span className="text-yellow-400 dark:text-yellow-300 opacity-70">
            {remaining}
          </span>
        )}
      </span>
    );
  };

  const handleSpotlightClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем переворот карточки при клике на кнопку
    dispatch(toggleSpotlight());
  };

  const handleExampleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем переворот карточки при клике на кнопку
    setShowExample(!showExample);
  };

  const handleFlip = () => {
    dispatch(flipCard());
    // Сбрасываем показ примера при перевороте
    setShowExample(false);
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

  if (!currentCard) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500 dark:text-gray-400">Нет карточек для изучения</p>
      </div>
    );
  }

  // Проверяем, является ли карточка неправильным глаголом
  const isIrregularVerb = currentCard.subcategory === WORD_SUBCATEGORIES.IRREGULAR_VERBS;
  const hasIrregularForms = isIrregularVerb && currentCard.irregularForms;
  const categoryMeta = resolveCategoryMeta({
    category: currentCard.category,
    subcategory: currentCard.subcategory ?? null,
  });

  const frontLabel =
    categoryMeta !== null ? (showEnglishOnFront ? categoryMeta.labelEn : categoryMeta.labelRu) : undefined;

  const backLabel =
    categoryMeta !== null ? (showEnglishOnFront ? categoryMeta.labelRu : categoryMeta.labelEn) : undefined;

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
          {/* Иконка грамматической категории (если есть) */}
          {categoryMeta && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
              <CategoryIconButton icon={categoryMeta.icon} label={frontLabel} />
            </div>
          )}
          {/* Плашка статуса */}
          {statusBadge && (
            <div className={`absolute top-4 right-4 ${statusBadge.color} text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md`}>
              {statusBadge.text}
            </div>
          )}
          {/* Кнопки подсказок */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <div className="flex items-center gap-3">
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
            {/* Кнопка примера */}
            {currentCard.example && (
              <button
                onClick={handleExampleClick}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${
                  showExample
                    ? 'bg-blue-400 dark:bg-blue-500 text-white shadow-lg shadow-blue-400/50'
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-slate-600'
                }`}
                title="Показать пример предложения"
              >
                <FontAwesomeIcon icon={faQuoteLeft} className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              {showEnglishOnFront ? currentCard.english : currentCard.translation}
            </h2>
            {/* Для неправильных глаголов на front side показываем только первую форму (без дополнительных форм) */}
            {showEnglishOnFront && !isIrregularVerb && currentCard.definition && (
              <p className="text-lg text-gray-600 dark:text-gray-300 italic">
                {currentCard.definition}
              </p>
            )}
            {/* Пример предложения внизу при нажатии на кнопку */}
            {showExample && currentCard.example && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg animate-fade-in">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-semibold">Пример:</p>
                <p className="text-base text-gray-800 dark:text-gray-200 italic">
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
          {/* Иконка грамматической категории (если есть) */}
          {categoryMeta && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
              <CategoryIconButton icon={categoryMeta.icon} label={backLabel} />
            </div>
          )}
          {/* Плашка статуса */}
          {statusBadge && (
            <div className={`absolute top-4 right-4 ${statusBadge.color} text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md`}>
              {statusBadge.text}
            </div>
          )}
          {/* Кнопки подсказок */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <div className="flex items-center gap-3">
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
            {/* Кнопка примера */}
            {currentCard.example && (
              <button
                onClick={handleExampleClick}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${
                  showExample
                    ? 'bg-blue-400 dark:bg-blue-500 text-white shadow-lg shadow-blue-400/50'
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-slate-600'
                }`}
                title="Показать пример предложения"
              >
                <FontAwesomeIcon icon={faQuoteLeft} className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="text-center">
            <h2 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4">
              {showEnglishOnFront ? currentCard.translation : currentCard.english}
            </h2>
            {/* Для неправильных глаголов на обратной стороне показываем блок с формами */}
            {hasIrregularForms && (
              <div className="mt-4">
                <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3">
                  <IrregularVerbForm
                    formType="past"
                    value={currentCard.irregularForms!.past}
                    title="Past Simple"
                  />
                  <IrregularVerbForm
                    formType="pastParticiple"
                    value={currentCard.irregularForms!.pastParticiple}
                    title="Past Participle"
                  />
                </div>
              </div>
            )}
            {!showEnglishOnFront && !isIrregularVerb && currentCard.definition && (
              <p className="text-lg text-gray-600 dark:text-gray-300 italic text-center">
                {currentCard.definition}
              </p>
            )}
            {/* Пример предложения внизу при нажатии на кнопку */}
            {showExample && currentCard.example && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg animate-fade-in">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-semibold">Пример:</p>
                <p className="text-base text-gray-800 dark:text-gray-200 italic">
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


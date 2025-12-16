/**
 * Quiz Question Component
 * Компонент для отображения вопроса квиза
 */

import { useState, useEffect } from 'react';
import type { QuizQuestion as QuizQuestionType } from '../types';
import type { QuizType } from '@/app/constants';

interface QuizQuestionProps {
  question: QuizQuestionType;
  quizType: QuizType;
  onAnswer: (answer: string) => void;
  showCorrectAnswer: boolean;
}

export default function QuizQuestion({
  question,
  quizType,
  onAnswer,
  showCorrectAnswer,
}: QuizQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  // Сбрасываем состояние при смене вопроса
  useEffect(() => {
    setSelectedAnswer(null);
    setHasAnswered(false);
  }, [question.id]);

  const handleSelectAnswer = (answer: string) => {
    if (hasAnswered) return;
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    if (!selectedAnswer || hasAnswered) return;
    setHasAnswered(true);
    onAnswer(selectedAnswer);
  };

  const renderMultipleChoice = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-6">
        Как будет "{question.word.english}" по-русски?
      </h2>

      <div className="space-y-3">
        {question.options?.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = hasAnswered && option === question.correctAnswer;
          const isWrong = hasAnswered && isSelected && !isCorrect;

          return (
            <button
              key={index}
              onClick={() => handleSelectAnswer(option)}
              disabled={hasAnswered}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                isCorrect && showCorrectAnswer
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : isWrong && showCorrectAnswer
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
              } ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {String.fromCharCode(65 + index)}) {option}
                </span>
                {hasAnswered && showCorrectAnswer && (
                  <>
                    {isCorrect && <span className="text-2xl">✅</span>}
                    {isWrong && <span className="text-2xl">❌</span>}
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {!hasAnswered && (
        <button
          onClick={handleSubmit}
          disabled={!selectedAnswer}
          className="w-full mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Ответить
        </button>
      )}

      {hasAnswered && (
        <div className="mt-6 text-center">
          <p className="text-lg font-medium">
            {selectedAnswer === question.correctAnswer ? (
              <span className="text-green-600 dark:text-green-400">✓ Правильно!</span>
            ) : (
              <span className="text-red-600 dark:text-red-400">✗ Неправильно</span>
            )}
          </p>
        </div>
      )}
    </div>
  );

  const handleTrueFalseAnswer = (answer: string) => {
    if (hasAnswered) return;
    setSelectedAnswer(answer);
    setHasAnswered(true);
    onAnswer(answer);
  };

  const renderTrueFalse = () => {
    const isCorrect = hasAnswered && selectedAnswer === question.correctAnswer;
    const isWrong = hasAnswered && selectedAnswer !== question.correctAnswer;

    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-4">
          Правда или ложь?
        </h2>

        <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md text-center mb-6">
          <p className="text-xl text-gray-700 dark:text-gray-300">
            <span className="font-bold">{question.word.english}</span> ={' '}
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {question.word.translation}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleTrueFalseAnswer('true')}
            disabled={hasAnswered}
            className={`p-6 rounded-lg border-2 transition-all ${
              hasAnswered && question.correctAnswer === 'true'
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : hasAnswered && selectedAnswer === 'true' && isWrong
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : selectedAnswer === 'true'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
            } ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex flex-col items-center">
              <span className="text-4xl">{hasAnswered && question.correctAnswer === 'true' ? '✅' : '✓'}</span>
              <p className="mt-2 font-semibold text-gray-900 dark:text-gray-100">Правда</p>
            </div>
          </button>

          <button
            onClick={() => handleTrueFalseAnswer('false')}
            disabled={hasAnswered}
            className={`p-6 rounded-lg border-2 transition-all ${
              hasAnswered && question.correctAnswer === 'false'
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : hasAnswered && selectedAnswer === 'false' && isWrong
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : selectedAnswer === 'false'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
            } ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex flex-col items-center">
              <span className="text-4xl">{hasAnswered && question.correctAnswer === 'false' ? '✅' : '✗'}</span>
              <p className="mt-2 font-semibold text-gray-900 dark:text-gray-100">Ложь</p>
            </div>
          </button>
        </div>

        {hasAnswered && (
          <div className="mt-6 text-center">
            <p className="text-lg font-medium">
              {isCorrect ? (
                <span className="text-green-600 dark:text-green-400">✓ Правильно!</span>
              ) : (
                <span className="text-red-600 dark:text-red-400">✗ Неправильно</span>
              )}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderFillInTheBlank = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-4">
        Заполните пропуск
      </h2>

      <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          {question.word.example}
        </p>
      </div>

      <input
        type="text"
        value={selectedAnswer || ''}
        onChange={(e) => setSelectedAnswer(e.target.value)}
        disabled={hasAnswered}
        placeholder="Введите слово..."
        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none dark:bg-slate-800 dark:text-gray-100"
      />

      {!hasAnswered && (
        <button
          onClick={handleSubmit}
          disabled={!selectedAnswer}
          className="w-full mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Ответить
        </button>
      )}

      {hasAnswered && (
        <div className="mt-4 text-center">
          <p className="text-lg font-medium">
            {selectedAnswer?.toLowerCase() === question.correctAnswer.toLowerCase() ? (
              <span className="text-green-600">✓ Правильно!</span>
            ) : (
              <>
                <span className="text-red-600">✗ Неправильно</span>
                {showCorrectAnswer && (
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Правильный ответ: <span className="font-bold">{question.correctAnswer}</span>
                  </p>
                )}
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto glass-strong rounded-2xl p-8 shadow-2xl">
      {quizType === 'multipleChoice' && renderMultipleChoice()}
      {quizType === 'trueFalse' && renderTrueFalse()}
      {quizType === 'fillInTheBlank' && renderFillInTheBlank()}
    </div>
  );
}

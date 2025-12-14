/**
 * Quiz Setup Page
 * Страница настройки квиза перед началом
 */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/shared/hooks/redux';
import { createQuiz } from '@/features/quizzes/quizzesSlice';
import {
  selectAllWordsInModule,
  selectCurrentCollectionWords,
} from '@/features/vocabulary/vocabularySlice';
import { QUIZ_TYPES_ARRAY } from '@/app/constants';
import type { QuizType } from '@/app/constants';
import type { CreateQuizParams } from '@/features/quizzes/types';

export default function QuizSetupPage() {
  const navigate = useNavigate();
  const { moduleId, collectionId } = useParams<{
    moduleId: string;
    collectionId?: string;
  }>();
  const dispatch = useAppDispatch();

  const allWords = useAppSelector(selectAllWordsInModule);
  const collectionWords = useAppSelector(selectCurrentCollectionWords);

  const [quizType, setQuizType] = useState<QuizType>('multipleChoice');
  const [questionCount, setQuestionCount] = useState(20);

  // Определяем, какие слова использовать
  const words = collectionId ? collectionWords : allWords;
  const maxQuestions = Math.min(words.length, 50);

  const handleStartQuiz = () => {
    if (words.length === 0) {
      alert('Нет доступных слов для квиза');
      return;
    }

    const params: CreateQuizParams = {
      type: quizType,
      moduleId: moduleId as 'A1',
      collectionId,
      settings: {
        questionCount: Math.min(questionCount, words.length),
      },
    };

    dispatch(
      createQuiz({
        params,
        words,
        allWords,
      })
    );

    navigate(`/quiz/${moduleId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="glass-strong rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Настройка квиза
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Выберите параметры перед началом
            </p>
          </div>

          {/* Quiz Type */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Тип квиза
            </label>
            <div className="grid grid-cols-2 gap-4">
              {QUIZ_TYPES_ARRAY.map((type) => (
                <button
                  key={type}
                  onClick={() => setQuizType(type)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    quizType === type
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {type === 'multipleChoice' && '📝 Выбор ответа'}
                    {type === 'trueFalse' && '✓✗ Правда/Ложь'}
                    {type === 'matching' && '🔗 Сопоставление'}
                    {type === 'fillInTheBlank' && '📄 Заполнить пропуск'}
                    {type === 'listening' && '🎧 На слух'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Количество вопросов: <span className="text-blue-600">{questionCount}</span>
            </label>
            <input
              type="range"
              min="5"
              max={maxQuestions}
              step="5"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>5</span>
              <span>{maxQuestions}</span>
            </div>
          </div>

          {/* Info */}
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-300">
              📚 Доступно слов: <span className="font-semibold">{words.length}</span>
            </p>
            {collectionId && (
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                Используются слова из выбранной коллекции
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg transition-colors"
            >
              Назад
            </button>
            <button
              onClick={handleStartQuiz}
              disabled={words.length === 0}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Начать квиз
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

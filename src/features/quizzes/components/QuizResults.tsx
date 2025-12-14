/**
 * Quiz Results Component
 * Отображение результатов квиза
 */

import type { QuizStats, Quiz } from '../types';

interface QuizResultsProps {
  stats: QuizStats;
  quiz: Quiz;
  onRetry: () => void;
  onExit: () => void;
}

export default function QuizResults({ stats, quiz, onRetry, onExit }: QuizResultsProps) {
  const getGradeEmoji = (accuracy: number) => {
    if (accuracy >= 90) return '🏆';
    if (accuracy >= 75) return '🎉';
    if (accuracy >= 50) return '👍';
    return '💪';
  };

  const getGradeText = (accuracy: number) => {
    if (accuracy >= 90) return 'Отлично!';
    if (accuracy >= 75) return 'Хорошо!';
    if (accuracy >= 50) return 'Неплохо!';
    return 'Попробуйте еще раз!';
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 py-8 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="glass-strong rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{getGradeEmoji(stats.accuracy)}</div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Квиз завершен!
            </h1>
            <p className="text-2xl text-gray-700 dark:text-gray-300 font-semibold">
              {getGradeText(stats.accuracy)}
            </p>
          </div>

          {/* Score */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white text-center">
            <p className="text-lg mb-2">Ваш результат</p>
            <p className="text-5xl font-bold">{stats.accuracy}%</p>
            <p className="text-sm mt-2 opacity-90">
              {stats.correctAnswers} из {stats.totalQuestions} правильно
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.correctAnswers}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Правильно</p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg text-center">
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {stats.incorrectAnswers}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Ошибок</p>
            </div>

            {quiz.timeSpent && (
              <div className="p-4 bg-white dark:bg-slate-800 rounded-lg text-center">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {formatTime(quiz.timeSpent)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Время</p>
              </div>
            )}

            {stats.averageTimePerQuestion && (
              <div className="p-4 bg-white dark:bg-slate-800 rounded-lg text-center">
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.averageTimePerQuestion}с
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Среднее на вопрос
                </p>
              </div>
            )}
          </div>

          {/* Mistakes */}
          {stats.incorrectAnswers > 0 && (
            <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-900 dark:text-red-300 font-medium mb-2">
                📝 Слова для повторения
              </p>
              <div className="space-y-2">
                {quiz.questions
                  .filter((q) => q.isCorrect === false)
                  .slice(0, 5)
                  .map((q) => (
                    <div
                      key={q.id}
                      className="flex justify-between text-sm text-red-800 dark:text-red-400"
                    >
                      <span>{q.word.english}</span>
                      <span className="font-medium">{q.word.translation}</span>
                    </div>
                  ))}
                {stats.incorrectAnswers > 5 && (
                  <p className="text-xs text-red-700 dark:text-red-500 mt-2">
                    ... и еще {stats.incorrectAnswers - 5} слов
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={onExit}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg transition-colors"
            >
              На главную
            </button>
            {quiz.settings.allowRetry && (
              <button
                onClick={onRetry}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                Пройти снова
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

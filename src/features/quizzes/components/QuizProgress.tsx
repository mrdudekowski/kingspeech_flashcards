/**
 * Quiz Progress Component
 * Индикатор прогресса квиза
 */

interface QuizProgressProps {
  current: number;
  total: number;
  percentage: number;
}

export default function QuizProgress({ current, total, percentage }: QuizProgressProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="glass-strong rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Вопрос {current} из {total}
          </span>
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {percentage}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Dots indicator */}
        <div className="flex gap-1 mt-4 flex-wrap">
          {Array.from({ length: total }).map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index < current
                  ? 'bg-blue-600 dark:bg-blue-400'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

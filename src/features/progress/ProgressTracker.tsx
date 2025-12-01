/**
 * ProgressTracker - компонент для отображения статистики прогресса
 */

import { useAppSelector } from '@/shared/hooks/redux';
import {
  selectStatistics,
} from './progressSlice';

export default function ProgressTracker() {
  const statistics = useAppSelector(selectStatistics);
  
  return (
    <div className="glass-strong rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        📊 Ваш прогресс
      </h2>
      
      {/* Карточки со статистикой */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Изучено слов</div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {statistics.totalWordsStudied}
          </div>
        </div>
        
        <div className="glass rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Квизов пройдено</div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {statistics.totalQuizzesCompleted}
          </div>
        </div>
        
        <div className="glass rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Средний балл</div>
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {statistics.averageScore}%
          </div>
        </div>
      </div>
      
      {/* Streak */}
      {statistics.studyStreak > 0 && (
        <div className="glass rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Дней подряд</div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {statistics.studyStreak}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


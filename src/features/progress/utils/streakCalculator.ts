/**
 * Утилита для расчета streak (серии дней подряд)
 */

/**
 * Рассчитать streak на основе последней даты изучения и текущего streak
 * @param lastStudyDate - последняя дата изучения (ISO строка)
 * @param currentStreak - текущий streak
 * @returns новый streak
 */
export function calculateStreak(lastStudyDate?: string, currentStreak: number = 0): number {
  if (!lastStudyDate) {
    // Если нет даты изучения - streak сброшен
    return 0;
  }
  
  const lastDate = new Date(lastStudyDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastStudy = new Date(lastDate);
  lastStudy.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - lastStudy.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Если последнее изучение было сегодня - увеличиваем streak
  if (diffDays === 0) {
    return currentStreak + 1;
  }
  
  // Если последнее изучение было вчера - продолжаем streak
  if (diffDays === 1) {
    return currentStreak + 1;
  }
  
  // Если прошло больше дня - streak сброшен, начинаем заново
  if (diffDays > 1) {
    return 1; // Начинаем новый streak с сегодняшнего дня
  }
  
  // Если дата в будущем (не должно быть, но на всякий случай)
  return currentStreak;
}


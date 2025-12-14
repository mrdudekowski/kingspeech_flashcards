/**
 * useDebounce Hook
 * Debounce значения с задержкой
 */

import { useState, useEffect } from 'react';

/**
 * Debounce значения - обновляется только после того, как значение не меняется в течение delay мс
 * 
 * @example
 * ```typescript
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 * 
 * useEffect(() => {
 *   // Выполнится только после 500мс без изменений searchTerm
 *   search(debouncedSearchTerm);
 * }, [debouncedSearchTerm]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Устанавливаем таймер для обновления debounced значения
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Очищаем таймер при размонтировании или при изменении value/delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useThrottle Hook
 * Throttle значения - обновляется не чаще чем раз в delay мс
 * 
 * @example
 * ```typescript
 * const [scrollY, setScrollY] = useState(0);
 * const throttledScrollY = useThrottle(scrollY, 100);
 * 
 * useEffect(() => {
 *   // Выполнится максимум раз в 100мс
 *   updateUI(throttledScrollY);
 * }, [throttledScrollY]);
 * ```
 */
export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const [lastRan, setLastRan] = useState<number>(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan >= delay) {
        setThrottledValue(value);
        setLastRan(Date.now());
      }
    }, delay - (Date.now() - lastRan));

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay, lastRan]);

  return throttledValue;
}

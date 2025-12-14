/**
 * Retry Utility с Exponential Backoff
 * Повторяет failed операции с увеличивающейся задержкой
 */

import { log } from './logger';

export interface RetryOptions {
  /**
   * Максимальное количество попыток (включая первую)
   * @default 3
   */
  maxAttempts?: number;

  /**
   * Начальная задержка в миллисекундах
   * @default 1000 (1 секунда)
   */
  initialDelay?: number;

  /**
   * Множитель для exponential backoff
   * @default 2
   */
  backoffMultiplier?: number;

  /**
   * Максимальная задержка в миллисекундах
   * @default 10000 (10 секунд)
   */
  maxDelay?: number;

  /**
   * Функция для определения, нужно ли повторять попытку для данной ошибки
   * @default (error) => true (повторять для всех ошибок)
   */
  shouldRetry?: (error: unknown) => boolean;

  /**
   * Callback перед каждой попыткой
   */
  onRetry?: (attempt: number, error: unknown) => void;
}

/**
 * Задержка с Promise
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Вычислить задержку для следующей попытки с exponential backoff
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  backoffMultiplier: number,
  maxDelay: number
): number {
  const exponentialDelay = initialDelay * Math.pow(backoffMultiplier, attempt - 1);
  return Math.min(exponentialDelay, maxDelay);
}

/**
 * Повторяет асинхронную функцию с exponential backoff
 *
 * @example
 * ```typescript
 * const data = await retryWithBackoff(
 *   () => fetch('https://api.example.com/data'),
 *   {
 *     maxAttempts: 3,
 *     initialDelay: 1000,
 *     shouldRetry: (error) => error.status >= 500,
 *   }
 * );
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    backoffMultiplier = 2,
    maxDelay = 10000,
    shouldRetry = () => true,
    onRetry,
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Проверяем, нужно ли повторять для этой ошибки
      if (!shouldRetry(error)) {
        log.warn('Retry', `Ошибка не подлежит повторению, выбрасываем`, error);
        throw error;
      }

      // Если это последняя попытка, выбрасываем ошибку
      if (attempt === maxAttempts) {
        log.error('Retry', `Все ${maxAttempts} попыток исчерпаны`, error);
        break;
      }

      // Вычисляем задержку
      const delayMs = calculateDelay(attempt, initialDelay, backoffMultiplier, maxDelay);

      log.warn(
        'Retry',
        `Попытка ${attempt}/${maxAttempts} не удалась. Повтор через ${delayMs}ms`,
        error
      );

      // Вызываем callback перед повтором (если есть)
      if (onRetry) {
        onRetry(attempt, error);
      }

      // Ждем перед следующей попыткой
      await delay(delayMs);
    }
  }

  // Все попытки исчерпаны, выбрасываем последнюю ошибку
  throw lastError;
}

/**
 * Создать функцию retry с предустановленными опциями
 *
 * @example
 * ```typescript
 * const retryFetch = createRetryFn({
 *   maxAttempts: 5,
 *   initialDelay: 500,
 * });
 *
 * const data1 = await retryFetch(() => fetch('/api/data1'));
 * const data2 = await retryFetch(() => fetch('/api/data2'));
 * ```
 */
export function createRetryFn(options: RetryOptions) {
  return <T>(fn: () => Promise<T>) => retryWithBackoff(fn, options);
}

/**
 * Предустановленные конфигурации retry
 */
export const retryPresets = {
  /**
   * Быстрый retry для легких операций (3 попытки, 500ms начальная задержка)
   */
  fast: {
    maxAttempts: 3,
    initialDelay: 500,
    backoffMultiplier: 2,
    maxDelay: 5000,
  },

  /**
   * Стандартный retry (3 попытки, 1s начальная задержка)
   */
  standard: {
    maxAttempts: 3,
    initialDelay: 1000,
    backoffMultiplier: 2,
    maxDelay: 10000,
  },

  /**
   * Агрессивный retry для критичных операций (5 попыток, 2s начальная задержка)
   */
  aggressive: {
    maxAttempts: 5,
    initialDelay: 2000,
    backoffMultiplier: 2,
    maxDelay: 30000,
  },

  /**
   * Retry только для сетевых ошибок
   */
  network: {
    maxAttempts: 3,
    initialDelay: 1000,
    backoffMultiplier: 2,
    maxDelay: 10000,
    shouldRetry: (error: unknown) => {
      // Повторяем только сетевые ошибки и HTTP 5xx
      if (error instanceof Error) {
        return (
          error.message.includes('fetch') ||
          error.message.includes('network') ||
          error.message.includes('timeout')
        );
      }
      return true;
    },
  },
} as const;

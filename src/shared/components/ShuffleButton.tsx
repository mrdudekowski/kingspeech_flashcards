import { useState, useEffect, useRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';

export interface ShuffleButtonProps extends ComponentPropsWithoutRef<'button'> {
  /** Обработчик клика на кнопку */
  onClick: () => void;
  /** Состояние блокировки кнопки */
  disabled?: boolean;
  /** Внешнее управление анимацией (опционально) */
  isAnimating?: boolean;
  /** Текст кнопки (по умолчанию "Перемешать") */
  children?: React.ReactNode;
}

/**
 * Анимированная кнопка "Перемешать" со стаком карт.
 *
 * UI-особенности:
 * - Визуальный стак из 3-4 карт
 * - Анимация перемешивания карт при клике
 * - Плавное затухание после анимации
 * - Стиль glass-strong в соответствии с дизайном приложения
 */
function ShuffleButton({
  onClick,
  disabled = false,
  isAnimating: externalIsAnimating,
  children = 'Перемешать',
  className = '',
  ...buttonProps
}: ShuffleButtonProps) {
  const [isShuffling, setIsShuffling] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Синхронизация с внешним состоянием анимации
  useEffect(() => {
    if (externalIsAnimating !== undefined) {
      if (externalIsAnimating && !isShuffling) {
        setIsShuffling(true);
      } else if (!externalIsAnimating && isShuffling) {
        // Сброс состояния при внешнем управлении
        setIsShuffling(false);
        setIsFadingOut(false);
      }
    }
  }, [externalIsAnimating, isShuffling]);

  // Очистка таймеров при размонтировании
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, []);

  const handleClick = () => {
    if (disabled || isShuffling) return;

    // Запускаем анимацию шаффла
    setIsShuffling(true);
    setIsFadingOut(false);
    onClick();

    // Очищаем предыдущие таймеры
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
    }

    // После завершения анимации шаффла запускаем fade-out
    timeoutRef.current = setTimeout(() => {
      setIsFadingOut(true);
      // После fade-out возвращаем в исходное состояние
      fadeTimeoutRef.current = setTimeout(() => {
        setIsShuffling(false);
        setIsFadingOut(false);
        timeoutRef.current = null;
        fadeTimeoutRef.current = null;
      }, 300); // Длительность fade-out
    }, 800); // Длительность анимации шаффла
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isShuffling}
      className={`shuffle-button relative px-4 py-2 rounded-lg font-medium transition-all duration-300 glass-strong text-gray-700 dark:text-gray-200 flex items-center gap-2 select-none ${
        disabled || isShuffling ? 'cursor-not-allowed opacity-60' : 'hover:scale-105'
      } ${className}`.trim()}
      aria-label="Перемешать карточки"
      {...buttonProps}
    >
      {/* Стак карт */}
      <div
        className={`shuffle-card-stack ${isShuffling ? 'is-shuffling' : ''} ${isFadingOut ? 'is-fading-out' : ''}`}
      >
        <div className="shuffle-card shuffle-card-1" />
        <div className="shuffle-card shuffle-card-2" />
        <div className="shuffle-card shuffle-card-3" />
      </div>

      {/* Текст кнопки */}
      <span className="shuffle-text relative z-10">{children}</span>
    </button>
  );
}

export default ShuffleButton;

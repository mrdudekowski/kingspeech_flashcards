import type { Icon } from '@phosphor-icons/react';
import type { ComponentPropsWithoutRef } from 'react';

export interface CategoryIconButtonProps extends ComponentPropsWithoutRef<'button'> {
  /** Иконка категории из categoryMeta (Phosphor Icon). */
  icon: Icon;
  /** Подпись под иконкой (опциональна). */
  label?: string;
}

/**
 * Анимированная круглая кнопка для отображения иконки грамматической категории.
 *
 * UI-особенности:
 * - Оранжево-жёлтый градиентный круг
 * - Анимация уменьшения круга при hover (scale)
 * - Опциональная подпись под иконкой
 */
function CategoryIconButton({ icon: IconComponent, label, className = '', ...buttonProps }: CategoryIconButtonProps) {
  return (
    <button
      type="button"
      className={`relative w-14 h-14 overflow-visible group text-center select-none ${className}`.trim()}
      aria-label={label}
      {...buttonProps}
    >
      {/* Градиентный круг с иконкой */}
      <div className="flex justify-center items-center w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-200 text-slate-900 dark:text-slate-950 transition-all duration-300 absolute top-0 left-1/2 -translate-x-1/2 scale-110 group-hover:scale-75 group-hover:origin-top shadow-lg shadow-orange-300/60">
        <IconComponent size={20} weight="fill" />
      </div>

      {/* Подпись под иконкой (опционально, появляется по hover) */}
      {label && (
        <div className="absolute left-1/2 -translate-x-1/2 top-[1.4rem] text-xs font-medium text-gray-700 dark:text-gray-200 leading-tight pointer-events-none opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-opacity transition-transform duration-300 text-center whitespace-nowrap px-1">
          <span className="inline-block">
            {label}
          </span>
        </div>
      )}
    </button>
  );
}

export default CategoryIconButton;

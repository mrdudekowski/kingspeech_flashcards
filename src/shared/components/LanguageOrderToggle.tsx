import { useState } from 'react';
import styled from 'styled-components';
import type { ComponentPropsWithoutRef } from 'react';
import ruFlag from '@/assets/language-switch-icons/russia.webp';
import ukFlag from '@/assets/language-switch-icons/united-kingdom.webp';

export interface LanguageOrderToggleProps extends ComponentPropsWithoutRef<'button'> {
  /** true = English first (EN → RU), false = Russian first (RU → EN) */
  isEnglishFirst: boolean;
  /** Колбэк переключения порядка языка */
  onToggle: () => void;
}

const flagSize = '2.5rem';
const buttonSize = flagSize;
const primaryColorLight = '#0ea5e9';
const primaryColorDark = '#38bdf8';
const glassBgLight = 'rgba(255, 255, 255, 0.6)';
const glassBgDark = 'rgba(15, 23, 42, 0.7)';
const glassBorderLight = 'rgba(255, 255, 255, 0.3)';
const glassBorderDark = 'rgba(255, 255, 255, 0.15)';

/**
 * Круглая кнопка для переключения порядка языка в флешкарточках.
 * 
 * UI-особенности:
 * - Круглая кнопка с glass-morphism эффектом
 * - Отображает флаг текущего языка (UK при isEnglishFirst, RU иначе)
 * - Элегантная анимация нажатия и переключения флага
 * - Поддержка светлой и тёмной темы
 */
function LanguageOrderToggle({
  isEnglishFirst,
  onToggle,
  className = '',
  ...buttonProps
}: LanguageOrderToggleProps) {
  const [isPressed, setIsPressed] = useState(false);

  const currentFlag = isEnglishFirst ? ukFlag : ruFlag;
  const ariaLabel = isEnglishFirst
    ? 'Переключить порядок языка (сначала английский)'
    : 'Переключить порядок языка (сначала русский)';

  const handleClick = () => {
    setIsPressed(true);
    onToggle();
    setTimeout(() => setIsPressed(false), 200);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <StyledWrapper className={className}>
      <button
        type="button"
        className={`language-toggle-button ${isPressed ? 'pressed' : ''}`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
        aria-pressed={isEnglishFirst}
        {...buttonProps}
      >
        <div
          className="flag-container"
          style={{ backgroundImage: `url(${currentFlag})` }}
        />
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .language-toggle-button {
    width: ${buttonSize};
    height: ${buttonSize};
    border-radius: 9999px;
    border: none;
    padding: 0;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: light-dark(${glassBgLight}, ${glassBgDark});
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid light-dark(${glassBorderLight}, ${glassBorderDark});
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    user-select: none;
    outline: none;
  }

  .language-toggle-button:hover {
    background: light-dark(
      rgba(255, 255, 255, 0.75),
      rgba(15, 23, 42, 0.85)
    );
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: scale(1.05);
  }

  .language-toggle-button:active,
  .language-toggle-button.pressed {
    transform: scale(0.96);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  }

  .language-toggle-button:focus-visible {
    outline: 2px solid light-dark(${primaryColorLight}, ${primaryColorDark});
    outline-offset: 2px;
  }

  .flag-container {
    width: ${flagSize};
    height: ${flagSize};
    border-radius: 50%;
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
    transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
    will-change: opacity, transform;
  }

  .language-toggle-button:hover .flag-container {
    transform: scale(1.1);
  }

  .language-toggle-button:active .flag-container,
  .language-toggle-button.pressed .flag-container {
    transform: scale(0.95);
  }

  .language-toggle-button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
  }

  .language-toggle-button:disabled:hover {
    transform: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

export default LanguageOrderToggle;

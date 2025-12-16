# План: Анимированный тумблер переключения языка с флагами

## Цель

Заменить простую кнопку `LanguageOrderButton` на анимированный тумблер в стиле rocker switch с fade-эффектами для текста и флагов. При выборе стороны: текст исчезает (fade-out), появляется флаг (fade-in); на противоположной стороне флаг исчезает, появляется текст.

## Архитектура

1. **Создать компонент `LanguageOrderToggle`** на основе предоставленного rocker switch
2. **Добавить логику показа/скрытия текста и флагов** с fade-анимациями
3. **Интегрировать флаги** из `src/assets/language-switch-icons/`
4. **Адаптировать стили** под дизайн приложения (glass-strong, темная тема)
5. **Заменить `LanguageOrderButton`** в `FlashcardDeck`

## Риски и сложности

1. **Синхронизация анимаций**: текст и флаг должны появляться/исчезать синхронно
2. **Управление состоянием**: нужно отслеживать, что показывать (текст или флаг) на каждой стороне
3. **CSS анимации**: fade-in/fade-out должны работать плавно и не конфликтовать с существующими стилями
4. **Размеры флагов**: флаги должны правильно вписываться в размеры кнопок тумблера
5. **Производительность**: множественные анимации не должны тормозить UI

## Задачи

### Задача 1: Создать базовую структуру компонента LanguageOrderToggle

**Файл:** `src/shared/components/LanguageOrderToggle.tsx` (новый файл)

- Создать интерфейс `LanguageOrderToggleProps`:
  - `isEnglishFirst: boolean` - текущее состояние (true = EN → RU)
  - `onToggle: () => void` - колбэк переключения
  - Стандартные пропсы кнопки через `ComponentPropsWithoutRef<'label'>`
- Скопировать базовую структуру из предоставленного Switch компонента
- Импортировать `styled-components`
- Создать базовую разметку:
  - `<label className="rocker rocker-small">`
  - `<input type="checkbox">`
  - `<span className="switch-left">Ru</span>`
  - `<span className="switch-right">Eng</span>`
- Подключить `checked` и `onChange` к `isEnglishFirst` и `onToggle`

### Задача 2: Импортировать флаги и создать контейнеры для них

**Файл:** `src/shared/components/LanguageOrderToggle.tsx`

- Импортировать флаги:
  - `import ruFlag from '@/assets/language-switch-icons/russia.webp'`
  - `import ukFlag from '@/assets/language-switch-icons/united-kingdom.webp'`
- Добавить контейнеры для флагов внутри `switch-left` и `switch-right`:
  - `<div className="flag-container flag-ru">` в `switch-left`
  - `<div className="flag-container flag-uk">` в `switch-right`
- Использовать `background-image` или `<img>` для отображения флагов
- Изначально флаги должны быть скрыты (`opacity: 0` или `display: none`)

### Задача 3: Добавить состояние для управления видимостью текста и флагов

**Файл:** `src/shared/components/LanguageOrderToggle.tsx`

- Добавить `useState` для отслеживания анимации:
  - `const [isAnimating, setIsAnimating] = useState(false)`
- Добавить логику определения, что показывать:
  - Когда `isEnglishFirst === true` (checked): слева показываем флаг UK, справа текст "Ru"
  - Когда `isEnglishFirst === false` (unchecked): слева показываем текст "Eng", справа флаг RU
- Создать функции для определения видимости:
  - `shouldShowLeftFlag()`, `shouldShowLeftText()`
  - `shouldShowRightFlag()`, `shouldShowRightText()`

### Задача 4: Создать CSS стили для базового rocker switch

**Файл:** `src/shared/components/LanguageOrderToggle.tsx` (в `StyledWrapper`)

- Скопировать базовые стили из предоставленного CSS
- Адаптировать размеры через `font-size` (использовать `rocker-small`)
- Настроить цвета:
  - Левая сторона (unchecked): серый фон `#ddd`
  - Правая сторона (checked): синий фон `#0084d0` (вместо красного)
- Убедиться, что трансформации (rotate, skew) работают корректно
- Добавить поддержку темной темы через CSS переменные или условные классы

### Задача 5: Добавить стили для контейнеров флагов

**Файл:** `src/shared/components/LanguageOrderToggle.tsx`

- Создать стили для `.flag-container`:
  - `position: absolute`
  - `inset: 0` (занимает всю область кнопки)
  - `background-size: cover`
  - `background-position: center`
  - `background-repeat: no-repeat`
  - `opacity: 0` по умолчанию
  - `transition: opacity 0.3s ease-in-out`
- Создать стили для `.flag-ru` и `.flag-uk`:
  - `background-image: url(${ruFlag})` и `url(${ukFlag})`
- Добавить z-index для правильного наложения (флаг поверх текста)

### Задача 6: Создать CSS анимации fade-in и fade-out для текста

**Файл:** `src/shared/components/LanguageOrderToggle.tsx`

- Добавить `@keyframes fadeOut`:
  - `0%`: `opacity: 1`
  - `100%`: `opacity: 0`
- Добавить `@keyframes fadeIn`:
  - `0%`: `opacity: 0`
  - `100%`: `opacity: 1`
- Применить к `.switch-left span.text`, `.switch-right span.text`:
  - Когда нужно скрыть: `animation: fadeOut 0.3s ease-in-out forwards`
  - Когда нужно показать: `animation: fadeIn 0.3s ease-in-out forwards`
- Использовать условные классы на основе `isEnglishFirst`

### Задача 7: Создать CSS анимации fade-in и fade-out для флагов

**Файл:** `src/shared/components/LanguageOrderToggle.tsx`

- Применить те же `@keyframes` к `.flag-container`
- Управлять видимостью через условные классы:
  - `.flag-container.show` - `opacity: 1`
  - `.flag-container.hide` - `opacity: 0`
- Синхронизировать с анимацией текста (одновременное появление/исчезновение)

### Задача 8: Реализовать логику условного рендеринга текста и флагов

**Файл:** `src/shared/components/LanguageOrderToggle.tsx`

- Обернуть текст в `<span className="text">` для возможности анимации
- Добавить условные классы к элементам:
  - К `switch-left`: `.show-flag` или `.show-text` в зависимости от состояния
  - К `switch-right`: аналогично
- Использовать условный рендеринг или CSS классы для показа/скрытия:
  ```tsx
  <span className={`text ${shouldShowLeftText() ? 'visible' : 'hidden'}`}>Eng</span>
  <div className={`flag-container flag-uk ${shouldShowLeftFlag() ? 'show' : 'hide'}`} />
  ```

### Задача 9: Синхронизировать анимации с изменением состояния

**Файл:** `src/shared/components/LanguageOrderToggle.tsx`

- В `handleChange`:
  - Установить `isAnimating = true`
  - Запустить fade-out для текущих видимых элементов
  - Через таймер (~150ms) запустить fade-in для новых элементов
  - После завершения анимации (~300ms) сбросить `isAnimating = false`
- Использовать `useEffect` для отслеживания изменений `isEnglishFirst`
- Убедиться, что анимации не конфликтуют при быстрых переключениях

### Задача 10: Адаптировать цвета под дизайн приложения

**Файл:** `src/shared/components/LanguageOrderToggle.tsx`

- Заменить цвета на соответствующие дизайну:
  - Левая сторона (unchecked, Eng): серый `#ddd` или `glass-strong` стиль
  - Правая сторона (checked, Ru): синий `#0084d0` или цвет из палитры приложения
- Добавить поддержку темной темы:
  - Использовать CSS переменные или условные классы
  - Адаптировать цвета фона и текста для темной темы
- Сохранить визуальную согласованность с другими компонентами

### Задача 11: Оптимизировать размеры и позиционирование флагов

**Файл:** `src/shared/components/LanguageOrderToggle.tsx`

- Настроить `background-size` для флагов:
  - Использовать `cover` или `contain` в зависимости от пропорций
  - Убедиться, что флаги не обрезаются и хорошо видны
- Добавить отступы внутри контейнеров, если нужно
- Проверить, что флаги центрированы и правильно масштабируются

### Задача 12: Добавить обработку состояний hover и focus

**Файл:** `src/shared/components/LanguageOrderToggle.tsx`

- Сохранить существующие hover эффекты из оригинального CSS
- Добавить focus стили для доступности
- Убедиться, что анимации не конфликтуют с hover состояниями
- Добавить `aria-label` и `role` для доступности

### Задача 13: Заменить LanguageOrderButton на LanguageOrderToggle в FlashcardDeck

**Файл:** `src/features/flashcards/FlashcardDeck.tsx`

- Удалить импорт `LanguageOrderButton`
- Добавить импорт `LanguageOrderToggle`
- Заменить компонент:
  ```tsx
  <LanguageOrderToggle
    isEnglishFirst={isEnglishFirst}
    onToggle={handleLanguageOrderChange}
  />
  ```
- Убедиться, что пропсы совместимы

### Задача 14: Удалить старый компонент LanguageOrderButton

**Файл:** `src/shared/components/LanguageOrderButton.tsx`

- Проверить, используется ли компонент где-то еще
- Если не используется - удалить файл
- Обновить импорты, если нужно

### Задача 15: Тестирование и отладка анимаций

- Проверить плавность fade-анимаций
- Убедиться, что текст и флаги появляются/исчезают синхронно
- Проверить работу в светлой и темной теме
- Проверить поведение при быстрых переключениях
- Проверить доступность (keyboard navigation, screen readers)
- Проверить адаптивность на мобильных устройствах

## Технические детали

### Структура компонента

```tsx
<label className="rocker rocker-small">
  <input type="checkbox" checked={isEnglishFirst} onChange={handleChange} />
  <span className="switch-left">
    <span className={`text ${showLeftText ? 'visible' : 'hidden'}`}>Eng</span>
    <div className={`flag-container flag-uk ${showLeftFlag ? 'show' : 'hide'}`} />
  </span>
  <span className="switch-right">
    <span className={`text ${showRightText ? 'visible' : 'hidden'}`}>Ru</span>
    <div className={`flag-container flag-ru ${showRightFlag ? 'show' : 'hide'}`} />
  </span>
</label>
```

### Логика показа элементов

- **Когда `isEnglishFirst === true` (checked, EN → RU)**:
  - Левая сторона (switch-left): показываем флаг UK, скрываем текст "Eng"
  - Правая сторона (switch-right): показываем текст "Ru", скрываем флаг RU

- **Когда `isEnglishFirst === false` (unchecked, RU → EN)**:
  - Левая сторона (switch-left): показываем текст "Eng", скрываем флаг UK
  - Правая сторона (switch-right): показываем флаг RU, скрываем текст "Ru"

### Временная шкала анимации

- **0-150ms**: Fade-out текущих видимых элементов (текст/флаг)
- **150-300ms**: Fade-in новых элементов (флаг/текст)
- **300ms+**: Состояние стабилизировано

### Производительность

- Использовать `transform` и `opacity` для анимаций (GPU-ускорение)
- Избегать анимации `width`, `height`, `display`
- Применить `will-change: opacity` к анимируемым элементам
- Использовать `requestAnimationFrame` для синхронизации, если нужно

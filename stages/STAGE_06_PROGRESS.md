# Этап 6: Система прогресса

**Статус:** ⏳ ОЖИДАЕТ  
**Дата начала:** -  
**Дата завершения:** -  

## Цель этапа

Реализовать отслеживание прогресса изучения слов и результатов квизов с сохранением в localStorage.

## Чекпойнты

### 1. Progress Slice
- [ ] Создан файл `src/features/progress/progressSlice.ts`
- [ ] Определен initialState с полями: studiedWords, quizResults, statistics
- [ ] Создан slice с именем 'progress'

### 2. Типы для прогресса
- [ ] Создан файл `src/features/progress/types.ts`
- [ ] Определен интерфейс `ProgressState`
- [ ] Используются типы из `shared/types` (WordProgress, QuizResult, ProgressStatistics)

### 3. Actions
- [ ] `markWordStudied` - отметить слово как изученное
- [ ] `updateWordProgress` - обновить прогресс слова (правильные/неправильные ответы)
- [ ] `saveQuizResult` - сохранить результат квиза
- [ ] `loadProgress` - загрузить прогресс из localStorage
- [ ] `clearProgress` - очистить весь прогресс

### 4. Селекторы
- [ ] `selectStudiedWords` - все изученные слова
- [ ] `selectWordProgress` - прогресс конкретного слова
- [ ] `selectQuizResults` - все результаты квизов
- [ ] `selectStatistics` - общая статистика
- [ ] `selectModuleProgress` - прогресс по модулю

### 5. Подключение к store
- [ ] Progress reducer добавлен в `store.ts`
- [ ] Типы обновлены (RootState включает progress)

### 6. Progress Storage Service
- [ ] Создан файл `src/services/progressStorage.ts`
- [ ] Реализована функция `saveProgress(progress: ProgressState)`
- [ ] Реализована функция `loadProgress(): ProgressState | null`
- [ ] Реализована функция `clearProgress()`
- [ ] Используется `STORAGE_KEYS.PROGRESS` из constants

### 7. Middleware для автосохранения
- [ ] Создан middleware для автосохранения прогресса
- [ ] Middleware слушает actions: markWordStudied, updateWordProgress, saveQuizResult
- [ ] Автоматически сохраняет в localStorage при изменении прогресса
- [ ] Middleware добавлен в store

### 8. Восстановление состояния
- [ ] При загрузке приложения вызывается `loadProgress()`
- [ ] Загруженный прогресс восстанавливается в Redux state
- [ ] Обрабатываются ошибки загрузки (невалидные данные)

### 9. ProgressTracker компонент
- [ ] Создан `src/features/progress/ProgressTracker.tsx`
- [ ] Отображает общую статистику (изучено слов, квизов)
- [ ] Отображает прогресс по модулям
- [ ] Отображает streak (дни подряд)
- [ ] Стилизован с glass-morphism

### 10. Интеграция с flashcards
- [ ] При изучении карточки вызывается `markWordStudied`
- [ ] Прогресс обновляется автоматически
- [ ] Сохраняется в localStorage

### 11. Интеграция с quizzes
- [ ] При завершении квиза вызывается `saveQuizResult`
- [ ] Результаты сохраняются в progress
- [ ] Ошибки (mistakes) обновляют прогресс слов

### 12. Тестирование
- [ ] Тест сохранения прогресса в localStorage
- [ ] Тест загрузки прогресса при старте
- [ ] Тест автосохранения при изменении
- [ ] Тест восстановления после перезагрузки страницы

## Зависимости

- ✅ Этап 5 должен быть завершен (Flashcards работают)

## Результат

Прогресс сохраняется в localStorage, восстанавливается при загрузке, автоматически обновляется при изучении.

## Примечания

- Используется `STORAGE_KEYS.PROGRESS` из constants
- Обрабатываются ошибки при загрузке невалидных данных
- Middleware обеспечивает автоматическое сохранение


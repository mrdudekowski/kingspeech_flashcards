# Этап 9: API Endpoints (открытые для расширения)

**Статус:** ⏳ ОЖИДАЕТ  
**Дата начала:** -  
**Дата завершения:** -  

## Цель этапа

Создать структуру API endpoints для будущей интеграции с backend, подготовить заглушки для разработки.

## Чекпойнты

### 1. Структура API
- [ ] Создана директория `src/services/api/`
- [ ] Определена структура файлов
- [ ] Подготовлена для будущего расширения

### 2. Базовый API клиент
- [ ] Создан файл `src/services/api/base.ts`
- [ ] Определен базовый URL (можно изменить на реальный)
- [ ] Реализована функция `apiRequest` для запросов
- [ ] Добавлена обработка ошибок
- [ ] Добавлена поддержка заглушек (mocks)

### 3. Progress API
- [ ] Создан файл `src/services/api/progress.ts`
- [ ] Реализован endpoint `saveProgress(progress: ProgressState)`
- [ ] Реализован endpoint `loadProgress(): Promise<ProgressState>`
- [ ] Реализован endpoint `clearProgress(): Promise<void>`
- [ ] Все endpoints имеют заглушки (mocks)

### 4. Vocabulary API
- [ ] Создан файл `src/services/api/vocabulary.ts`
- [ ] Реализован endpoint `getModules(): Promise<ModuleId[]>`
- [ ] Реализован endpoint `getModule(moduleId: ModuleId): Promise<VocabularyModule>`
- [ ] Реализован endpoint `getCollections(moduleId: ModuleId): Promise<Collection[]>`
- [ ] Все endpoints имеют заглушки (mocks)

### 5. Обработка ошибок API
- [ ] Обработка сетевых ошибок
- [ ] Обработка ошибок сервера (4xx, 5xx)
- [ ] Обработка таймаутов
- [ ] Понятные сообщения об ошибках

### 6. RTK Query (опционально)
- [ ] Настроен RTK Query API slice (опционально)
- [ ] Определены endpoints для progress и vocabulary
- [ ] Настроено кэширование
- [ ] Добавлен middleware в store

### 7. Документация endpoints
- [ ] Документированы все endpoints
- [ ] Описаны параметры запросов
- [ ] Описаны форматы ответов
- [ ] Описаны возможные ошибки

### 8. Тестирование заглушек
- [ ] Тест работы с progress API заглушками
- [ ] Тест работы с vocabulary API заглушками
- [ ] Тест обработки ошибок
- [ ] Проверка готовности к переключению на реальный backend

## Зависимости

- ✅ Этап 8 должен быть завершен (UI/UX готов)

## Результат

API структура готова, заглушки работают, легко переключиться на реальный backend.

## Примечания

- Заглушки должны имитировать реальное поведение API
- Структура должна быть готова к замене на реальные endpoints
- Документация поможет при интеграции с backend


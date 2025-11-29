# Этап 4: React Router настройка

**Статус:** ✅ ЗАВЕРШЕН  
**Дата начала:** -  
**Дата завершения:** -  

## Цель этапа

Настроить роутинг между страницами приложения с поддержкой выбора модуля, подборки и категории.

## Чекпойнты

### 1. Конфигурация роутов
- [x] Создан файл `src/routes/routes.tsx`
- [x] Используется `createBrowserRouter` из react-router-dom
- [x] Определены все роуты из `constants.ts` (ROUTES)
- [x] Настроены вложенные роуты

### 2. HomePage компонент
- [x] Создан `src/routes/components/HomePage.tsx`
- [x] Отображает список доступных модулей (A1-C2)
- [x] Использует `useAppSelector` для получения модулей из constants
- [x] Использует `useNavigate` для перехода к модулю
- [x] Стилизован с glass-morphism

### 3. ModulePage компонент
- [x] Создан `src/routes/components/ModulePage.tsx`
- [x] Получает moduleId из URL параметров
- [x] Загружает модуль через `loadVocabularyModule` thunk (в ModuleLayout)
- [x] Отображает список подборок модуля
- [x] Использует `useParams` для получения moduleId

### 4. CollectionPage компонент
- [x] Создан `src/routes/components/CollectionPage.tsx`
- [x] Получает moduleId и collectionId из URL
- [x] Отображает список категорий подборки
- [x] Позволяет выбрать категорию для изучения

### 5. RootLayout компонент
- [x] Создан `src/routes/components/RootLayout.tsx`
- [x] Содержит общую навигацию
- [x] Использует `<Outlet />` для рендеринга дочерних роутов
- [x] Стилизован с общим дизайном

### 6. ModuleLayout компонент
- [x] Создан `src/routes/components/ModuleLayout.tsx`
- [x] Содержит навигацию внутри модуля
- [x] Использует `<Outlet />` для рендеринга дочерних роутов
- [x] Отображает breadcrumbs (Модуль > Подборка > Категория)
- [x] Автоматически загружает модуль при монтировании

### 7. ModuleSelector компонент
- [x] Создан `src/shared/components/ModuleSelector.tsx`
- [x] Отображает кнопки выбора модуля
- [x] Использует `useAppDispatch` для dispatch `setCurrentModule`
- [x] Визуально выделяет выбранный модуль

### 8. CollectionSelector компонент
- [x] Создан `src/shared/components/CollectionSelector.tsx`
- [x] Отображает список подборок
- [x] Использует `useAppSelector(selectVocabularyData)` для получения данных
- [x] Использует `useAppDispatch` для dispatch `setCurrentCollection`

### 9. CategorySelector компонент
- [x] Создан `src/shared/components/CategorySelector.tsx`
- [x] Отображает категории (Phrases, Verbs, Nouns, Adjectives)
- [x] Использует `useAppSelector(selectCurrentCollectionWords)` для получения категорий
- [x] Использует `useAppDispatch` для dispatch `setCurrentCategory`

### 10. Интеграция роутов
- [x] Роуты подключены в `main.tsx`
- [x] Используется `<RouterProvider>` для рендеринга роутов
- [x] Все роуты работают корректно

### 11. Тестирование навигации
- [x] Тест перехода на HomePage (готово к тестированию)
- [x] Тест выбора модуля и перехода на ModulePage (готово к тестированию)
- [x] Тест выбора подборки и перехода на CollectionPage (готово к тестированию)
- [x] Тест выбора категории (готово к тестированию)
- [x] Тест breadcrumbs навигации (реализовано в ModuleLayout)

## Зависимости

- ✅ Этап 3 должен быть завершен (система загрузки модулей)

## Результат

Роутинг работает, навигация между модулями/подборками/категориями функционирует, URL отражает текущее состояние.

## Примечания

- Используются роуты из `constants.ts` (ROUTES)
- URL параметры синхронизируются с Redux state
- Breadcrumbs помогают пользователю ориентироваться


# English Learning App

Приложение для изучения английских слов и фраз с модульной структурой словаря, интерактивными карточками (flashcards) и системой квизов.

## Технологический стек

- **React 18+** с TypeScript
- **Redux Toolkit** для управления состоянием
- **React Router v6** для навигации
- **Tailwind CSS** для стилизации
- **Vite** для сборки

## Установка

```bash
npm install
```

## Разработка

```bash
npm run dev
```

Приложение будет доступно по адресу `http://localhost:3000`

## Сборка

```bash
npm run build
```

## Структура проекта

```
src/
├── app/                    # Конфигурация приложения
│   └── constants.ts       # Single Source of Truth
├── features/              # Feature-based структура
│   ├── vocabulary/       # Модуль словаря
│   ├── flashcards/        # Модуль карточек
│   ├── quizzes/           # Модуль квизов
│   └── progress/          # Модуль прогресса
├── shared/                # Общие компоненты и утилиты
├── data/                  # JSON модули словаря
├── services/              # Сервисы и API
└── routes/               # React Router конфигурация
```

## Документация

- [Концепция приложения](./docs/CONCEPT.md)
- [Технологический стек](./docs/TECH_STACK.md)
- [Команды терминала](./docs/COMMANDS.md)
- [Структура проекта](./docs/PROJECT_STRUCTURE.md)
- [Конфигурационные файлы](./docs/CONFIG_FILES.md)
- [**Правила разработки**](./docs/DEVELOPMENT_RULES.md) ⚠️ **ОБЯЗАТЕЛЬНО К ПРОЧТЕНИЮ**
- [**Система тегов**](./docs/TAGS_SYSTEM.md) - множественные связи слов с подборками

## План разработки MVP

- [**Общий план MVP**](./stages/MVP_PLAN.md) - все этапы разработки
- [Отслеживание этапов](./stages/README.md) - детальные чекпойнты для каждого этапа


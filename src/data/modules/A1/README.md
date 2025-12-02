# Модуль A1 - Beginner Level

## Структура файлов

```
A1/
├── index.json                    # Метаданные модуля и список коллекций
├── collections/                  # Отдельные файлы коллекций
│   ├── basic-verbs.json
│   ├── daily-life.json
│   ├── clothes-accessories.json
│   └── ...
└── README.md                     # Эта документация
```

## Формат index.json

Файл `index.json` содержит только метаданные модуля и ссылки на коллекции:

```json
{
  "moduleId": "A1",
  "name": "Beginner Level",
  "description": "...",
  "collections": [
    {
      "id": "basic-verbs",
      "name": "Basic English Verbs",
      "description": "...",
      "file": "./collections/basic-verbs.json"
    }
  ]
}
```

## Формат коллекции

Каждая коллекция хранится в отдельном файле `collections/<collection-id>.json`:

```json
{
  "id": "basic-verbs",
  "name": "Basic English Verbs",
  "description": "...",
  "categories": {
    "verbs": [
      {
        "id": "play-1",
        "english": "play",
        "translation": "играть",
        "category": "verbs",
        "subcategory": "regularVerbs",
        "tags": ["common"]
      }
    ]
  }
}
```

## Правила добавления слов

### Обязательные поля

- `id` - уникальный идентификатор (генерируется автоматически: `english-word-N`)
- `english` - английское слово или фраза
- `translation` - перевод на русский
- `category` - одна из: `phrases`, `verbs`, `nouns`, `adjectives`

### Опциональные поля

- `subcategory` - подкатегория (например, `regularVerbs`, `countableNouns`)
- `definition` - определение на английском
- `example` - пример использования
- `tags` - массив семантических тегов (НЕ включать `collectionId` или `moduleId`)
- `irregularForms` - для неправильных глаголов:
  ```json
  {
    "past": "was/were",
    "pastParticiple": "been"
  }
  ```

### Правила тегов

- **НЕ** включать `collectionId` в теги (это дублирование)
- **НЕ** включать `moduleId` в теги (это дублирование)
- Использовать только семантические теги: `common`, `daily-life`, `food`, `travel`, и т.д.

### Генерация ID

ID генерируется автоматически по правилу:
1. Берется `english`, приводится к lowercase
2. Все не-буквенно-цифровые символы заменяются на дефис
3. Добавляется суффикс `-1`, `-2`, и т.д. при коллизиях

Примеры:
- `"play"` → `"play-1"`
- `"get up"` → `"get-up-1"`
- `"can't"` → `"cant-1"`

## Инструменты

### Добавление слова

```bash
node scripts/add-word.cjs \
  --collection basic-verbs \
  --english "read" \
  --translation "читать" \
  --category verbs \
  --subcategory regularVerbs \
  --tags "common"
```

### Валидация модулей

```bash
node scripts/validate-vocabulary.cjs
```

Проверяет:
- Структуру модулей и коллекций
- Уникальность `collection.id` и `word.id`
- Существование файлов коллекций
- Валидность полей слов

## Single Source of Truth

- **Структура данных**: описана в `vocabularyModule.schema.json` и `vocabularyCollection.schema.json`
- **TypeScript типы**: `src/shared/types/index.ts`
- **Источник словаря**: файлы в `src/data/modules/A1/`
- **Логика загрузки**: `src/services/vocabularyLoader.ts`
- **Селекторы**: `src/features/vocabulary/vocabularySlice.ts`

Все эти места должны быть синхронизированы. При изменении структуры обновляйте все источники.


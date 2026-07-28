# [1.2.0](https://github.com/Tinkerbells/mobx-query/compare/devtools-v1.1.0...devtools-v1.2.0) (2026-07-28)


### Bug Fixes

* **devtools:** restore solid package release ([a88674e](https://github.com/Tinkerbells/mobx-query/commit/a88674e6693a07bf73c8cd431f9d47ea9cc3f3d8))


### Features

* **devtools:** migrate to solid tanstack panel ([e658474](https://github.com/Tinkerbells/mobx-query/commit/e65847479028110daf9fddcfed0616c2e7c7d27c))
* **devtools:** refresh mobx visual identity ([b06b54a](https://github.com/Tinkerbells/mobx-query/commit/b06b54a21a211e9d255df336fd6352d0cd10b8c7))

# Changelog - MobX Query DevTools

## [Unreleased] - 2025-12-12

### Added
- ✨ Продвинутый JSON редактор с подсветкой синтаксиса
  - Подсветка синтаксиса для всех типов JSON (объекты, массивы, строки, числа, boolean, null)
  - Автоматическое форматирование с настраиваемыми отступами
  - Сохранение позиции каретки при редактировании
  - Валидация JSON в реальном времени
  - Автоматическое применение изменений (не требуется кнопка Apply)
  - ContentEditable подход для плавного редактирования

### Changed
- 🔄 JsonEditor теперь использует contentEditable вместо textarea
- 🎨 Улучшенная цветовая схема для JSON элементов
- 🚀 Упрощен QueryInspector - удалена кнопка Apply, изменения применяются автоматически
- 📝 Обновлена документация (FIXES.md, COMPONENTS.md)

### Fixed
- ✅ Исправлена проблема с редактированием данных запроса
- ✅ Добавлена возможность изменять состояния isSuccess и isError
- ✅ Правильное отображение данных в Explorer и JSON режимах

## Основные возможности

### JSON Editor
- **Подсветка синтаксиса**: Каждый тип данных имеет свой цвет
  - Числа: `#a9dc76` (зеленый)
  - Строки: `#78dce8` (голубой)
  - Ключи: `#ff6188` (розовый)
  - Boolean: `#a5d6ff` (true), `#f85149` (false)
  - Скобки: `#84aecc` (фигурные), `#d26a6a` (квадратные)

- **Умное форматирование**: Автоматические отступы и форматирование
- **Сохранение курсора**: Позиция курсора сохраняется при обновлении
- **Валидация**: Показывает ошибки в некорректном JSON

### State Management
- Переключение состояний через чекбоксы (isLoading, isSuccess, isError)
- Прямое редактирование данных запроса
- Автоматическая синхронизация с MobX observable
- Поддержка refetch, invalidate, fetchMore операций

### UI/UX
- Два режима просмотра данных: Explorer (древовидный) и JSON (редактор)
- Фильтрация и сортировка запросов
- Счетчики статусов (Fresh, Fetching, Stale, Error)
- Адаптивный интерфейс с изменяемым размером панели

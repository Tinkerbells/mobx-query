## [1.4.1](https://github.com/Tinkerbells/mobx-query/compare/devtools-v1.4.0...devtools-v1.4.1) (2026-07-29)


### Bug Fixes

* **devtools:** keep restore error action visible ([55bc97e](https://github.com/Tinkerbells/mobx-query/commit/55bc97e958a42ab099a528fc714fd2a6fcf3aa86))

# [1.4.0](https://github.com/Tinkerbells/mobx-query/compare/devtools-v1.3.2...devtools-v1.4.0) (2026-07-29)


### Features

* **devtools:** add persistent query state overrides ([41538a8](https://github.com/Tinkerbells/mobx-query/commit/41538a8acc9dcf68e48cd3fd5a693d29a2f5ffec))

## [1.3.2](https://github.com/Tinkerbells/mobx-query/compare/devtools-v1.3.1...devtools-v1.3.2) (2026-07-28)


### Bug Fixes

* **devtools:** make query actions observable ([df6f953](https://github.com/Tinkerbells/mobx-query/commit/df6f953cb5bea00db5954466348b4582f2a6b506))

## [1.3.1](https://github.com/Tinkerbells/mobx-query/compare/devtools-v1.3.0...devtools-v1.3.1) (2026-07-28)


### Bug Fixes

* **ci:** restore devtools type-check ([9f94bbb](https://github.com/Tinkerbells/mobx-query/commit/9f94bbb0a2b612168799090512248a688129a161))
* **devtools:** remove viewport event overlay ([c2948f0](https://github.com/Tinkerbells/mobx-query/commit/c2948f0bb94c76ac078044c99609d6ef8634ca7e))

# [1.3.0](https://github.com/Tinkerbells/mobx-query/compare/devtools-v1.2.1...devtools-v1.3.0) (2026-07-28)


### Features

* **devtools:** add mobx query lifecycle inspection ([bf78445](https://github.com/Tinkerbells/mobx-query/commit/bf78445e4df9fdf743b884148eae2ddf2ef0d85e))

## [1.2.1](https://github.com/Tinkerbells/mobx-query/compare/devtools-v1.2.0...devtools-v1.2.1) (2026-07-28)


### Bug Fixes

* **devtools:** restore interactive query states ([0e4b8ac](https://github.com/Tinkerbells/mobx-query/commit/0e4b8ac254a91bd3e535d974ab0bd006d64aea6f))

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

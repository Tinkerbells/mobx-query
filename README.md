# @tinkerbells/mobx-query Monorepo

Библиотека для кеширования запросов на основе MobX, организованная как Turborepo monorepo.

## Структура проекта

```
mobx-query/
├── apps/                    # Приложения
│   ├── docs/               # Документация
│   └── web/                # Web демо
├── packages/
│   ├── mobx-query/         # Основная библиотека @tinkerbells/mobx-query
│   ├── ui/                 # Общие UI компоненты
│   ├── eslint-config/      # Общие ESLint конфигурации
│   └── typescript-config/  # Общие TypeScript конфигурации
└── turbo.json              # Конфигурация Turborepo

```

## Основная библиотека

Основная библиотека находится в `packages/mobx-query/`. Подробная документация доступна в [packages/mobx-query/README.md](packages/mobx-query/README.md).

## Установка зависимостей

```bash
pnpm install
```

## Доступные команды

### Сборка

```bash
pnpm build
```

Собирает все пакеты и приложения в monorepo.

### Разработка

```bash
pnpm dev
```

Запускает режим разработки для всех приложений.

### Тестирование

```bash
pnpm tests        # Запуск тестов
pnpm tests:ci     # Запуск тестов в CI режиме
```

### Линтинг

```bash
pnpm lint         # Проверка кода
pnpm lint:types   # Проверка типов TypeScript
pnpm format       # Форматирование кода с помощью Prettier
```

## Технологии

- **Turborepo** - для управления monorepo
- **pnpm** - менеджер пакетов
- **TypeScript** - типизация
- **Vite** - сборщик для приложений
- **ESLint** - линтинг
- **Prettier** - форматирование

## Публикация

Пакет публикуется в GitHub Packages. Убедитесь, что в `.npmrc` прописан `@tinkerbells:registry=https://npm.pkg.github.com/` и валидный `GITHUB_TOKEN`.

## Лицензия

См. [LICENSE](packages/mobx-query/LICENSE)

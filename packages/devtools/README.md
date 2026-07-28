# @tinkerbells88/mobx-query-devtools

Developer tools для визуализации и отладки MobX Query кеша.

## Установка

```bash
npm install @tinkerbells88/mobx-query-devtools --save-dev
# или
pnpm add -D @tinkerbells88/mobx-query-devtools
```

## Использование

Монтируйте DevTools только в dev режиме:

```typescript
import { MobxQuery } from '@tinkerbells88/mobx-query';
import { mountMobxQueryDevtools } from '@tinkerbells88/mobx-query-devtools';

const cacheService = new MobxQuery({
  enabledAutoFetch: true,
  fetchPolicy: 'cache-first'
});

// Только в dev режиме
if (process.env.NODE_ENV === 'development') {
  mountMobxQueryDevtools(cacheService, document.body);
}
```

### API

```typescript
function mountMobxQueryDevtools(
  client: MobxQuery,
  target?: HTMLElement
): () => void
```

**Параметры:**
- `client` - экземпляр MobxQuery
- `target` - DOM элемент для монтирования (по умолчанию: `document.body`)

**Возвращает:** функцию для размонтирования DevTools

### Пример с React

```tsx
import { useEffect } from 'react';
import { cacheService } from './services/cache';
import { mountMobxQueryDevtools } from '@tinkerbells88/mobx-query-devtools';

function App() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const unmount = mountMobxQueryDevtools(cacheService);
      return unmount;
    }
  }, []);

  return <YourApp />;
}
```

## Разработка

```bash
# Запуск dev-сервера для локальной разработки
pnpm dev

# Сборка библиотеки
pnpm build
```

## Возможности

- 📊 Визуализация всех queries и их состояний
- 🔍 Инспектор данных кеша
- ⚡ Реактивное обновление при изменении кеша
- 🎨 Shadow DOM для изоляции стилей
- 📦 Легковесная сборка (external dependencies)

## Лицензия

См. [LICENSE](../../packages/mobx-query/LICENSE)

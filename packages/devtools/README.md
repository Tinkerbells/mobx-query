# @tinkerbells88/mobx-query-devtools

Framework-agnostic DevTools for `@tinkerbells88/mobx-query`.

It provides a floating panel with query and mutation states, cache-data inspection and editing, filtering, lifecycle history, plus refetch, invalidate and infinite-query pagination controls. Its UI is mounted in a Shadow DOM, so host application styles do not leak in.

```ts
import { mountMobxQueryDevtools } from '@tinkerbells88/mobx-query-devtools';
import { cacheService } from './cache-service';

if (import.meta.env.DEV) {
  const disposeDevtools = mountMobxQueryDevtools(cacheService);
  // Call disposeDevtools() when the application root unmounts.
}
```

`mountMobxQueryDevtools(client, target?, options?)` returns an unmount function.

Options:

- `initialIsOpen` — opens the panel immediately.
- `position` — `bottom-right` (default) or `bottom-left`.

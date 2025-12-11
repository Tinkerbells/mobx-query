import { createApp } from 'vue';
import { MobxQuery } from '@tinkerbells/mobx-query';

import App from './App.vue';
import { mountMobxQueryDevtools } from './index';
import './style.css';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mobxQuery = new MobxQuery({ enabledAutoFetch: false });

const demoFetcher = {
  queries: {
    doc: mobxQuery.createQuerySet((id: string) => ({
      keys: [id],
      execute: async () => {
        await wait(150);
        return { id, name: `Document ${id}`, updatedAt: new Date().toISOString() };
      },
    })),
  },
  infiniteQueries: {
    list: mobxQuery.createInfiniteQuerySet((tag: string) => ({
      keys: [tag],
      execute: async ({ offset, count }) => {
        await wait(120);
        const total = 28;
        const end = Math.min(offset + count, total);

        return Array.from({ length: Math.max(0, end - offset) }, (_, idx) => ({
          id: `${tag}-${offset + idx + 1}`,
          tag,
        }));
      },
    })),
  },
};

function bootstrapDemo() {
  const docA = demoFetcher.queries.doc.create('alpha');
  const docB = demoFetcher.queries.doc.createWithConfig(
    { fetchPolicy: 'network-only' },
    'beta',
  );
  const list = demoFetcher.infiniteQueries.list.create('demo');

  docA.sync();
  docB.sync();
  list.sync();

  // подгружаем вторую страницу, чтобы показать infinite состояние
  setTimeout(() => list.fetchMore(), 500);

  mountMobxQueryDevtools(mobxQuery);
}

bootstrapDemo();

createApp(App).mount('#app');

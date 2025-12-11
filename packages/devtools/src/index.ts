import { createApp } from 'vue';
import type { MobxQuery } from '@tinkerbells/mobx-query';

import { DevToolsAdapter } from './core/adapter';
import { DevToolsStore } from './core/store';
import { cssStyles } from './styles';
import DevTools from './ui/DevTools.vue';

export type { DevToolsStore } from './core/store';

export function mountMobxQueryDevtools(
  client: MobxQuery,
  target: HTMLElement = document.body,
) {
  const adapter = new DevToolsAdapter(client);
  const store = new DevToolsStore(adapter);

  const host = document.createElement('div');
  target.appendChild(host);
  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = cssStyles;
  shadow.appendChild(style);

  const mountPoint = document.createElement('div');
  shadow.appendChild(mountPoint);

  const app = createApp(DevTools, { store });
  app.mount(mountPoint);

  return () => {
    store.destroy();
    app.unmount();
    host.remove();
  };
}

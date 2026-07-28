import type {
  MobxQuery,
  MobxQueryDevtoolsEntry,
  MobxQueryDevtoolsEvent,
} from '@tinkerbells88/mobx-query';

/**
 * Адаптер поверх публичного devtools API MobxQuery.
 */
export class DevToolsAdapter {
  private readonly client: MobxQuery;

  constructor(client: MobxQuery) {
    this.client = client;
  }

  public list(): MobxQueryDevtoolsEntry[] {
    return this.client.getDevtoolsEntries();
  }

  public events(): MobxQueryDevtoolsEvent[] {
    return this.client.getDevtoolsEvents()
  }

  public subscribe(listener: (event: MobxQueryDevtoolsEvent) => void) {
    return this.client.subscribeDevtools(listener);
  }
}

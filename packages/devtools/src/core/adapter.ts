import type {
  MobxQuery,
  MobxQueryDevtoolsEntry,
} from '@tinkerbells88/mobx-query';

/**
 * Адаптер поверх публичного devtools API MobxQuery.
 * Он не обращается к `query.data`, потому что этот getter может инициировать
 * auto-fetch в прикладном коде.
 */
export class DevToolsAdapter {
  private readonly client: MobxQuery;

  constructor(client: MobxQuery) {
    this.client = client;
  }

  public list(): MobxQueryDevtoolsEntry[] {
    return this.client.getDevtoolsEntries();
  }

  public subscribe(listener: () => void) {
    return this.client.subscribeDevtools(listener);
  }
}

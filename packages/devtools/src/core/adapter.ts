import type { MobxQuery } from '@tinkerbells/mobx-query';

export type QuerySnapshot = {
  hash: string;
  key: unknown[];
  instance: unknown;
};

type MobxQueryInternals = {
  keys?: Map<string, unknown[]>;
  queriesMap?: {
    get: (key: string) => unknown;
    has: (key: string) => boolean;
  };
};

/**
 * Адаптер для доступа к приватным структурам MobxQuery.
 * Требуется для того, чтобы получить список созданных квери.
 */
export class DevToolsAdapter {
  private readonly client: MobxQuery;

  constructor(client: MobxQuery) {
    this.client = client;
  }

  private get internals(): MobxQueryInternals {
    return this.client as unknown as MobxQueryInternals;
  }

  public list(): QuerySnapshot[] {
    const keys = this.internals.keys;
    const queriesMap = this.internals.queriesMap;

    if (!keys || !queriesMap) {
      return [];
    }

    const snapshots: QuerySnapshot[] = [];

    keys.forEach((key, hash) => {
      const instance = queriesMap.get(hash);

      if (instance) {
        snapshots.push({ hash, key, instance });
      }
    });

    return snapshots;
  }

  public has(hash: string) {
    return Boolean(this.internals.queriesMap?.has(hash));
  }
}

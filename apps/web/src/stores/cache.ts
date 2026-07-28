import { MobxQuery } from "@tinkerbells88/mobx-query";

const createCacheService = () =>
  new MobxQuery<unknown>({ enabledAutoFetch: true, fetchPolicy: 'cache-first' });

export const cacheService = createCacheService();

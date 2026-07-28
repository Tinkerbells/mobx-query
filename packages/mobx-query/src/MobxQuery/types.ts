import { type InfiniteQuery } from '../InfiniteQuery';
import { type Query } from '../Query';
import {
  type CacheKey,
  type MobxQueryDevtoolsState,
} from '../types';

/**
 * Внутриний тип кешируемого стора
 */
export type CachedQuery<TResult, TError, TIsBackground extends boolean> =
  | Query<TResult, TError, TIsBackground>
  | InfiniteQuery<TResult, TError, TIsBackground>;

export type UnknownCachedQuery = CachedQuery<unknown, unknown, false>;

/**
 * Хэш ключа
 */
export type KeyHash = string;

/**
 * Набор ключей
 */
export type Keys = {
  queryKey: CacheKey[];
  dataKeyHash: KeyHash;
  statusKeyHash: KeyHash;
  queryKeyHash: KeyHash;
  backgroundStatusKeyHash: KeyHash;
};

export type MobxQueryDevtoolsQuery = {
  getDevtoolsState: () => MobxQueryDevtoolsState;
  sync?: () => void;
  invalidate?: () => void;
  fetchMore?: () => void;
  forceUpdate?: (data: unknown) => void;
};

export type MobxQueryDevtoolsEntry = {
  hash: string;
  key: CacheKey[];
  type: 'query' | 'infinite' | 'mutation';
  query: MobxQueryDevtoolsQuery;
};

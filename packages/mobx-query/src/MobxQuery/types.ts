import { type InfiniteQuery } from '../InfiniteQuery';
import { type Query } from '../Query';
import { type CacheKey } from '../types';

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

import { type DeepPartial } from 'utility-types';

import { type CreateQueryParams, type MobxQuery } from '../../MobxQuery';
import { type Query } from '../../Query';
import { type CacheKey } from '../../types';
import { generateQuerySetBaseKey, generateQuerySetKeys } from '../utils';

export type QuerySetConfig = {
  name?: string;
};

export type QuerySetConfigurator<TParams extends any[], TResponse> = (
  ...params: TParams
) => {
  keys?: CacheKey[];
  execute: () => Promise<TResponse>;
};

/**
 * Набор queries под одним ключем с целью повышения читаемости кода и удобства инвалидации по общему ключу
 */
export class QuerySet<
  TParams extends any[],
  TResponse,
  TDefaultError = unknown,
> {
  /**
   * Хэш от queryConfigurator
   */
  private readonly baseKey: CacheKey;

  constructor(
    private readonly _cache: MobxQuery,
    private readonly _queryConfigurator: QuerySetConfigurator<
      TParams,
      TResponse
    >,
    config?: QuerySetConfig,
  ) {
    this.baseKey = config?.name ?? generateQuerySetBaseKey(_queryConfigurator);
  }

  /**
   * Создает query в кэше. Добавляет его в набор
   * @returns Query объект
   * @example
   * const docQuery = docFetcher.queries.doc.create('docId')
   * // Получает данные
   * docQuery.sync()
   */
  public create = <TError = TDefaultError>(...params: TParams) => {
    const { keys, execute } = this.configureQuery(...params);

    return this._cache.createQuery<TResponse, TError>(keys, execute);
  };

  /**
   * Создает query в кэше с дополнительными параметрами конфигурации. Добавляет его в набор
   * @param config - Параметры конфигурации query. Например, fetchPolicy
   * @param params - Параметры запроса
   * @returns Query объект
   * @example
   * const docQuery = docFetcher.queries.doc.createWithConfig(
   *   { fetchPolicy: 'network-only' },
   *   'docId',
   * )
   * // Получает данные из query
   * docQuery.sync()
   */
  public createWithConfig = <
    TError = TDefaultError,
    TIsBackground extends boolean = false,
  >(
    config: CreateQueryParams<Awaited<TResponse>, TError, TIsBackground>,
    ...params: TParams
  ) => {
    const { keys, execute } = this.configureQuery(...params);

    return this._cache.createQuery<TResponse, TError, TIsBackground>(
      keys,
      execute,
      config,
    );
  };

  /**
   * Инвалидирует текущий query в кэше
   * @param keys - Дополнительные ключи для инвалидации. Если не указаны, то инвалидируется весь набор query
   * @example
   * const docFetcher = {
   *   doc: mobxQuery.createQuerySet((id: string) => ({
   *     execute: () => httpService.get(`/doc/${id}?page=${page}`),
   *   })),
   * };
   *
   * // Инвалидирует все query doc
   * docFetcher.doc.invalidate()
   *
   * // Инвалидирует query doc с конкретным переданным id. Доступные ключи инвалидации зависят от указанных additionalKeys, переданных при определении query в фабрике createDataFetcher
   * docFetcher.doc.invalidate('docId')
   */
  public invalidate = (...params: DeepPartial<TParams>) => {
    if (params.length === 0) {
      this._cache.invalidate([this.baseKey]);

      return;
    }

    const { keys } = this.configureQuery(...(params as TParams));

    this._cache.invalidate(keys, 'chain-match');
  };

  private configureQuery = (...params: TParams) => {
    const { keys, execute } = this._queryConfigurator(...params);

    return {
      keys: generateQuerySetKeys(
        this.baseKey,
        (keys as CacheKey[] | undefined) ?? (params as unknown as CacheKey[]),
      ),
      execute,
    };
  };

  /**
   * Форс метод для установки данных во все зависимые квери
   */
  public forceUpdate = (
    update: (data?: TResponse) => TResponse,
    ...params: DeepPartial<TParams>
  ) => {
    const { keys } = this.configureQuery(...(params as TParams));

    this._cache
      .getExistsQueries<Query<TResponse, TDefaultError>>(keys, 'chain-match')
      .forEach((query) => {
        query.forceUpdate(update);
      });
  };
}

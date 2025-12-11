import { type DeepPartial } from 'utility-types';

import {
  type CreateInfiniteQueryParams,
  type MobxQuery,
} from '../../MobxQuery';
import { type InfiniteQuery } from '../../InfiniteQuery';
import { type CacheKey } from '../../types';
import { generateQuerySetBaseKey, generateQuerySetKeys } from '../utils';

export type InfiniteQuerySetConfig = {
  name?: string;
};

export type InfiniteQuerySetConfigurator<TParams extends any[], TResponse> = (
  ...params: TParams
) => {
  keys?: CacheKey[];
  execute: (infiniteParams: {
    offset: number;
    count: number;
  }) => Promise<TResponse[]>;
};

/**
 * Набор infinite queries под одним ключем с целью повышения читаемости кода и удобства инвалидации по общему ключу
 */
export class InfiniteQuerySet<
  TParams extends any[],
  TResponse,
  TDefaultError = unknown,
> {
  private readonly baseKey: CacheKey;

  constructor(
    private readonly _cache: MobxQuery,
    private readonly _queryConfigurator: InfiniteQuerySetConfigurator<
      TParams,
      TResponse
    >,
    config?: InfiniteQuerySetConfig,
  ) {
    this.baseKey = config?.name ?? generateQuerySetBaseKey(_queryConfigurator);
  }

  /**
   * Создает infinite query в кэше. Добавляет его в набор
   * @returns InfiniteQuery объект
   * @example
   * const docListQuery = docFetcher.infiniteQueries.docList.create()
   * // Получает данные
   * docListQuery.sync()
   */
  public create = <TError = TDefaultError>(...params: TParams) => {
    const { keys, execute } = this.configureQuery(...params);

    return this._cache.createInfiniteQuery<TResponse, TError>(keys, execute);
  };

  /**
   * Создает infinite query в кэше с дополнительными параметрами конфигурации. Добавляет его в набор
   * @param config - Параметры конфигурации infinite query. Например, fetchPolicy или incrementCount
   * @param params - Параметры запроса
   * @returns InfiniteQuery объект
   * @example
   * const docListQuery = docFetcher.infiniteQueries.docList.createWithConfig(
   *   { fetchPolicy: 'network-only', incrementCount: 10 },
   *   'docId',
   * )
   * // Получает данные из query
   * docListQuery.sync()
   */
  public createWithConfig = <
    TError = TDefaultError,
    TIsBackground extends boolean = false,
  >(
    config: CreateInfiniteQueryParams<TResponse, TError, TIsBackground>,
    ...params: TParams
  ) => {
    const { keys, execute } = this.configureQuery(...params);

    return this._cache.createInfiniteQuery<TResponse, TError, TIsBackground>(
      keys,
      execute,
      config,
    );
  };

  /**
   * Инвалидирует текущий набор infinite queries в кэше
   * @param params - Параметры функции, переданной в createInfiniteQuerySet при создании набора. Если не указаны, то инвалидируется все query
   * @example
   * const docFetcher = {
   *   infiniteQueries: {
   *     docList: createInfiniteQuerySet('docList', (search: string) => ({
   *       execute: ({ count, offset }) => httpService.get(`/doc/${search}?count=${count}&offset=${offset}`),
   *     }),
   *   }
   * };
   *
   * // Инвалидирует infinite query с конкретным переданным search
   * docFetcher.infiniteQueries.docList.invalidate('документ1')
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
    update: (data?: TResponse[]) => TResponse[],
    ...params: DeepPartial<TParams>
  ) => {
    const { keys } = this.configureQuery(...(params as TParams));

    this._cache
      .getExistsQueries<InfiniteQuery<TResponse, TDefaultError>>(
        keys,
        'chain-match',
      )
      .forEach((query) => query.forceUpdate(update));
  };
}

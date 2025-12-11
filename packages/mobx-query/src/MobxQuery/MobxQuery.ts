import { AdaptableMap } from '../AdaptableMap';
import { DataStorageFactory } from '../DataStorage';
import {
  type InfiniteExecutor,
  InfiniteQuery,
  type InfiniteQueryParams,
} from '../InfiniteQuery';
import {
  Mutation,
  type MutationExecutor,
  type MutationParams,
} from '../Mutation';
import { PollingService } from '../PollingService';
import { Query, type QueryExecutor, type QueryParams } from '../Query';
import {
  InfiniteQuerySet,
  type InfiniteQuerySetConfig,
  type InfiniteQuerySetConfigurator,
  MutationSet,
  QuerySet,
  type QuerySetConfig,
  type QuerySetConfigurator,
} from '../Sets';
import { type StatusStorage, StatusStorageFactory } from '../StatusStorage';
import { SynchronizationService } from '../SynchronizationService';
import type { CacheKey, FetchPolicy } from '../types';

import type { CachedQuery, KeyHash, Keys, UnknownCachedQuery } from './types';

/**
 * Стандартный обработчик ошибки запроса,
 * будет вызван, если при вызове sync не был передан отдельный onError параметр
 */
type OnError<TError = unknown> = (error: TError) => void;

type WithSynchronization = {
  /**
   * Флаг, отвечающий за синхронизацию данных между инстансами одной и той же квери в разных вкладках браузера
   * @default либо значение переданное при создании MobxQuery, либо false
   */
  enabledSynchronization?: boolean;
};

type WithPollingTime = {
  /**
   * Время в мс, раз в которое необходимо инвалидировать query
   */
  pollingTime?: number;
};

type MobxQueryParams = {
  /**
   * Политика получения данных по умолчанию.
   * @enum cache-first - данные сначала берутся из кеша, если их нет, тогда идет обращение к сети, ответ записывается в кэш
   * @enum network-only - данные всегда берутся из сети, при этом ответ записывается в кэш
   */
  fetchPolicy?: FetchPolicy;
  /**
   * обработчик ошибок по умолчанию
   */
  onError?: OnError;
  /**
   * Флаг, отвечающий за автоматический запрос данных при обращении к полю data по умолчанию.
   * @default false
   */
  enabledAutoFetch?: boolean;
  /**
   * Флаг, отвечающий за синхронизацию данных между инстансами одной и той же квери в разных вкладках браузера
   * @default false
   */
  enabledSynchronization?: boolean;
};

export type CreateQueryParams<
  TResult,
  TError,
  TIsBackground extends boolean,
> = Omit<
  QueryParams<TResult, TError, TIsBackground>,
  'dataStorage' | 'statusStorage' | 'backgroundStatusStorage' | 'submitValidity'
> & {
  /**
   * Режим фонового обновления
   * @default false
   */
  isBackground?: TIsBackground;
} & WithSynchronization &
  WithPollingTime;

export type CreateInfiniteQueryParams<
  TResult,
  TError,
  TIsBackground extends boolean,
> = Omit<
  InfiniteQueryParams<TResult, TError, TIsBackground>,
  'dataStorage' | 'statusStorage' | 'backgroundStatusStorage' | 'submitValidity'
> & {
  /**
   * Режим фонового обновления
   * @default false
   */
  isBackground?: TIsBackground;
} & WithSynchronization &
  WithPollingTime;

export type CreateMutationParams<TResult, TError> = MutationParams<
  TResult,
  TError
>;

/**
 * Стратегия инвалидации кэша
 * @property 'partial-match' - Проверяет наличие хотя бы одной части ключа в кэше
 * @property 'chain-match' - Проверяет наличие полной связки ключей в кэше
 */
export type InvalidateStrategy = 'partial-match' | 'chain-match';

type QueryType = typeof Query.name | typeof InfiniteQuery.name;

/**
 * Параметры поддающиеся установке значению по умолчанию
 */
type FallbackAbleCreateParams<TResult, TError, TIsBackground extends boolean> =
  | Pick<
      CreateQueryParams<TResult, TError, TIsBackground>,
      | 'onError'
      | 'fetchPolicy'
      | 'enabledAutoFetch'
      | 'isBackground'
      | 'enabledSynchronization'
      | 'pollingTime'
    >
  | Pick<
      CreateInfiniteQueryParams<TResult, TError, TIsBackground>,
      | 'onError'
      | 'fetchPolicy'
      | 'enabledAutoFetch'
      | 'isBackground'
      | 'enabledSynchronization'
      | 'pollingTime'
    >;

/**
 * Объединяющий тип параметров рассчитываемых внутренней логикой для создания квери
 */
type InternalCreateQueryParams<
  TResult,
  TError,
  TIsBackground extends boolean,
> =
  | Pick<
      QueryParams<TResult, TError, TIsBackground>,
      | 'dataStorage'
      | 'backgroundStatusStorage'
      | 'onError'
      | 'statusStorage'
      | 'submitValidity'
      | 'fetchPolicy'
      | 'enabledAutoFetch'
    >
  | Pick<
      InfiniteQueryParams<TResult, TError, TIsBackground>,
      | 'dataStorage'
      | 'backgroundStatusStorage'
      | 'onError'
      | 'statusStorage'
      | 'submitValidity'
      | 'fetchPolicy'
      | 'enabledAutoFetch'
    >;

/**
 * Сервис, позволяющий кэшировать данные.
 */
export class MobxQuery<TDefaultError = void> {
  /**
   * Объект соответствия хешей ключей и их значений
   */
  private keys = new Map<KeyHash, CacheKey[]>();

  /**
   * Map соответствия хешей ключей к запомненным сторам
   */
  private queriesMap = new AdaptableMap<UnknownCachedQuery>();

  /**
   * Фабрика создания хранилищ данных для обычного Query
   */
  private queryDataStorageFactory = new DataStorageFactory();

  /**
   * Фабрика создания хранилищ статусов между экземплярами Query и экземллярами Infinite Query.
   */
  private statusStorageFactory = new StatusStorageFactory();

  /**
   * Стандартный обработчик ошибок, будет использован, если не передан другой
   */
  private readonly defaultErrorHandler?: OnError;

  /**
   * Стандартное поведение политики кеширования
   */
  private readonly defaultFetchPolicy: FetchPolicy;

  /**
   * Флаг, отвечающий за автоматический запрос данных при обращении к полю data
   * @default false
   */
  private readonly defaultEnabledAutoFetch: boolean;

  private readonly defaultEnabledSynchronization: boolean;

  private readonly synchronizationService: SynchronizationService;

  private readonly pollingService: PollingService;

  private serialize = (data: CacheKey | CacheKey[]) => JSON.stringify(data);

  constructor(
    {
      onError,
      fetchPolicy = 'cache-first',
      enabledAutoFetch = false,
      enabledSynchronization = false,
    }: MobxQueryParams = {},
    _BroadcastChannel:
      | typeof BroadcastChannel
      | undefined = globalThis.BroadcastChannel,
    _document: Document | undefined = globalThis.document,
  ) {
    this.defaultErrorHandler = onError;
    this.defaultFetchPolicy = fetchPolicy;
    this.defaultEnabledAutoFetch = enabledAutoFetch;
    this.defaultEnabledSynchronization = enabledSynchronization;

    this.pollingService = new PollingService(
      this.queriesMap,
      this.invalidateByKeyHash,
      _document,
    );

    this.synchronizationService = new SynchronizationService(
      this.statusStorageFactory,
      this.queryDataStorageFactory,
      this.pollingService,
      _BroadcastChannel,
    );
  }

  /**
   * Проверяет пересечение ключей в зависимости от стратегии
   * @param invalidatedKeys - Ключи для инвалидации
   * @param queryKeys - Ключи запроса
   * @param strategy - Стратегия проверки:
   * - 'chain-match' - все ключи из invalidatedKeys должны присутствовать в queryKeys
   * - 'partial-match' - хотя бы один ключ из invalidatedKeys должен быть в queryKeys
   */
  private checkTouchedElement = (
    invalidatedKeys: CacheKey[],
    queryKeys: CacheKey[],
    strategy: InvalidateStrategy,
  ) => {
    const serializedInvalidatedKeys = invalidatedKeys.map(this.serialize);

    if (strategy === 'chain-match') {
      return serializedInvalidatedKeys.every((invalidatedKey) =>
        queryKeys.some(
          (queryKey) => invalidatedKey === this.serialize(queryKey),
        ),
      );
    }

    return queryKeys.some((queryKey) =>
      serializedInvalidatedKeys.find(
        (invalidatedKey) => invalidatedKey === this.serialize(queryKey),
      ),
    );
  };

  /**
   * Метод для инвалидации по списку ключей, предполагается использование из домена
   * @param invalidatedKeys - Массив ключей для инвалидации
   * @param strategy - Стратегия инвалидации. 'chain-match' - инвалидировать при совпадении связки ключей в кэше, 'partial-match' - инвалидировать при частичном совпадении ключей. По умолчанию 'partial-match'
   * @example
   * // Инвалидация по частичному совпадению ключей
   * mobxQuery.invalidate(['users', '1']); // Инвалидирует все query, содержащие ключ 'users' или '1'
   *
   * // Инвалидация по совпадению связки ключей
   * mobxQuery.invalidate(['users', '1'], 'chain-match'); // Инвалидирует только query с точным набором ключей ['users', '1']
   */
  public invalidate = (
    invalidatedKeys: CacheKey[],
    strategy: InvalidateStrategy = 'partial-match',
  ) => {
    this.getExistsKeyHashes(invalidatedKeys, strategy).forEach(({ keyHash }) =>
      this.invalidateByKeyHash(keyHash),
    );
  };

  private invalidateByKeyHash = (keyHash: KeyHash) => {
    this.queriesMap.get(keyHash)?.invalidate();
    // Конвертируем инвалидированный квери в слабый,
    // чтобы сборщик мусора мог удалить неиспользуемые квери
    this.queriesMap.convertToWeak(keyHash);
    this.pollingService.clean(keyHash);
  };

  /**
   * Метод для получения массива хешей ключей на основании ключей и стратегии
   */
  private getExistsKeyHashes = (
    keys: CacheKey[],
    strategy: InvalidateStrategy = 'partial-match',
  ) =>
    [...this.keys.keys()]
      .map((keyHash) => ({ keyHash, queryKeys: this.keys.get(keyHash) }))
      .filter(
        ({ queryKeys, keyHash }) =>
          queryKeys &&
          this.checkTouchedElement(keys, queryKeys, strategy) &&
          this.queriesMap.has(keyHash),
      );

  /**
   * метод для получения массива существующий квери на основании ключей и стратегии
   */
  public getExistsQueries = <TQuery = UnknownCachedQuery>(
    keys: CacheKey[],
    strategy: InvalidateStrategy = 'partial-match',
  ) =>
    this.getExistsKeyHashes(keys, strategy).reduce<Array<TQuery>>(
      (acc, { keyHash }) => {
        const query = this.queriesMap.get(keyHash);

        if (query) {
          acc.push(query as TQuery);
        }

        return acc;
      },
      [],
    );

  // Метод для подтверждения того, что квери успешно получил валидные данные
  private submitValidity = (
    keys: Keys,
    isCacheable: boolean,
    enabledSynchronization: boolean,
    pollingTime?: number,
  ) => {
    if (enabledSynchronization) {
      this.synchronizationService.emit(keys);
    }

    if (pollingTime) {
      this.pollingService.setupTimer(keys.queryKeyHash, pollingTime);
    }

    // 'network-only' квери не будут конвертироваться,
    // следовательно, они всегда будут храниться как "слабые",
    // что позволит сборщику мусора удалять их из памяти при отсутствии ссылок
    if (!isCacheable) {
      return;
    }

    // конвертируем квери в сильный,
    // чтобы сборщик мусора не удалил наш кеш преждевременно
    this.queriesMap.convertToStrong(keys.queryKeyHash);
  };

  /**
   * Метод инвалидации всех query
   */
  public invalidateQueries = () =>
    [...this.keys.keys()].forEach(this.invalidateByKeyHash);

  /**
   * Метод, который занимается проверкой наличия квери по ключу,
   * и если нет, создает новый, добавляет его к себе в память, и возвращает его пользователю
   */
  private getCachedQuery = <TResult, TError, TIsBackground extends boolean>(
    key: CacheKey[],
    createInstance: (
      internalParams: InternalCreateQueryParams<TResult, TError, TIsBackground>,
    ) => CachedQuery<TResult, TError, TIsBackground>,
    type: QueryType,
    createParams?: FallbackAbleCreateParams<TResult, TError, TIsBackground>,
  ) => {
    const fetchPolicy = createParams?.fetchPolicy || this.defaultFetchPolicy;

    const keys = this.makeKeys(
      key,
      fetchPolicy,
      createParams?.isBackground ?? false,
      type,
    );

    const cachedQuery = this.queriesMap.get(keys.queryKeyHash);

    if (cachedQuery) {
      return cachedQuery;
    }

    const query = createInstance({
      onError: (createParams?.onError ||
        this.defaultErrorHandler) as OnError<TError> as OnError<TError>,
      enabledAutoFetch:
        createParams?.enabledAutoFetch ?? this.defaultEnabledAutoFetch,
      fetchPolicy,
      dataStorage: this.queryDataStorageFactory.getStorage<TResult>(
        keys.dataKeyHash,
      ),
      statusStorage: this.statusStorageFactory.getStorage<TError>(
        keys.statusKeyHash,
      ),
      backgroundStatusStorage: this.getBackgroundStatusStorage<
        TError,
        TIsBackground
      >(
        keys.backgroundStatusKeyHash,
        Boolean(createParams?.isBackground) as TIsBackground,
      ),
      submitValidity: () =>
        this.submitValidity(
          keys,
          fetchPolicy !== 'network-only',
          createParams?.enabledSynchronization ??
            this.defaultEnabledSynchronization,
          createParams?.pollingTime,
        ),
    });

    this.queriesMap.set(
      keys.queryKeyHash,
      query as CachedQuery<unknown, unknown, false>,
    );

    this.keys.set(keys.queryKeyHash, keys.queryKey);

    return query;
  };

  /**
   * Метод для создания ключей к внутренним хранилищам
   */
  private makeKeys = (
    rootKey: CacheKey[],
    fetchPolicy: FetchPolicy,
    isBackground: boolean,
    type: QueryType,
  ): Keys => {
    // C введением StrictMode в реакт 18, проявилась проблема,
    // что network-only квери, созданные в одном реакт компоненте,
    // создаются дважды (т.к. все хуки вызываются дважды)
    // и т.к. мы не ограничиваем момент запроса,
    // то можем получить эффект, что оба network-only квери
    // делают по отдельному запросу к данным единомоментно.
    // Для решения этой проблемы, добавляем уникальный ключ даты, с обнуляемыми милисекундами,
    // что позволит создавать одинаковые network-only квери в течении одной секунды.
    // Остается крайне редкий корнер кейс, когда разница между созданиями квери крайне мала,
    // но все таки первый был создан в одной секунде, а последующее создание уже попало в следующую секунду.
    // Этот кейс крайне маловероятен, и будет проявляться только в дев режиме с включенным StrictMode,
    // поэтому мы пренебрегаем решением этой проблемы, в угоду упрощения.
    const date =
      fetchPolicy === 'network-only' ? new Date().setMilliseconds(0) : null;
    const queryKey = [...rootKey, { fetchPolicy, date, isBackground, type }];
    const queryKeyHash = this.serialize(queryKey);
    const dataKeyHash = this.serialize([...rootKey, { type }]);
    const statusKeyHash = this.serialize([...rootKey, { type, date }]);
    const backgroundStatusKeyHash = this.serialize([
      ...rootKey,
      { type, isBackground, date },
    ]);

    return {
      queryKey,
      queryKeyHash,
      statusKeyHash,
      backgroundStatusKeyHash,
      dataKeyHash,
    };
  };

  private getBackgroundStatusStorage = <TError, TIsBackground extends boolean>(
    keyHash: KeyHash,
    hasBackground: TIsBackground,
  ) =>
    (hasBackground
      ? this.statusStorageFactory.getStorage<TError>(keyHash)
      : null) as TIsBackground extends true ? StatusStorage<TError> : null;

  /**
   * Метод создания стора, кешируется
   */
  public createQuery = <
    TResult,
    TError = TDefaultError,
    TIsBackground extends boolean = false,
  >(
    key: CacheKey[],
    executor: QueryExecutor<TResult>,
    params?: CreateQueryParams<TResult, TError, TIsBackground>,
  ) =>
    this.getCachedQuery<TResult, TError, TIsBackground>(
      key,
      (internalParams) =>
        new Query(executor, {
          ...params,
          ...internalParams,
          dataStorage: internalParams.dataStorage,
        }),
      Query.name,
      params,
    ) as Query<TResult, TError, TIsBackground>;

  /**
   * Метод создания инфинит стора, кешируется
   */
  public createInfiniteQuery = <
    TResult,
    TError = TDefaultError,
    TIsBackground extends boolean = false,
  >(
    key: CacheKey[],
    executor: InfiniteExecutor<TResult>,
    params?: CreateInfiniteQueryParams<TResult, TError, TIsBackground>,
  ) =>
    this.getCachedQuery<TResult, TError, TIsBackground>(
      key,
      (internalParams) =>
        new InfiniteQuery(executor, {
          ...params,
          ...internalParams,
          dataStorage: internalParams.dataStorage,
        }),
      InfiniteQuery.name,
      params,
    ) as InfiniteQuery<TResult, TError, TIsBackground>;

  /**
   * Метод создания мутации, не кешируется
   */
  public createMutation = <
    TResult,
    TError = TDefaultError,
    TExecutorParams = void,
  >(
    executor: MutationExecutor<TResult, TExecutorParams>,
    params?: CreateMutationParams<TResult, TError>,
  ) =>
    new Mutation<TResult, TError, TExecutorParams>(executor, {
      ...params,
      onError: params?.onError || this.defaultErrorHandler,
    });

  /**
   * Создает набор queries под одним ключем
   * @param configurator - Функция конфигурации набора запросов. Она должна возвращать объект с полями:
   *   - keys (необязательно): массив ключей для кеширования;
   *   - execute: функция, которая возвращает промис с результатом выполнения запроса.
   * @example
   * const docQuerySet = mobxQuery.createQuerySet((id: string, count?: number) => ({
   *   execute: () => docEndpoint.getDoc(id),
   * }));
   *
   * const docQuery = docQuerySet.create();
   *
   * docQuery.data // { data: [id, count] }
   */
  // biome-ignore lint/suspicious/noExplicitAny: any нужен для вывода типов
  public createQuerySet = <TParams extends any[], TResponse>(
    configurator: QuerySetConfigurator<TParams, TResponse>,
    config?: QuerySetConfig,
  ) =>
    new QuerySet<TParams, TResponse, TDefaultError>(this, configurator, config);

  /**
   * Создает набор infinite queries под одним ключем
   * @param configurator - Функция конфигурации набора запросов. Она должна возвращать объект с полями:
   *   - keys (необязательно): массив ключей для кеширования;
   *   - execute: функция, которая возвращает промис с результатом выполнения запроса.
   * @example
   * const docListInfiniteQuerySet = mobxQuery.createInfiniteQuerySet((id: string, count?: number) => ({
   *   execute: ({ offset, count }) => docEndpoint.getDocList(id, offset, count),
   * }));
   *
   * const docListInfiniteQuery = docListInfiniteQuerySet.create();
   *
   * docListInfiniteQuery.data
   */
  // biome-ignore lint/suspicious/noExplicitAny: any нужен для вывода типов
  public createInfiniteQuerySet = <TParams extends any[], TResponse>(
    configurator: InfiniteQuerySetConfigurator<TParams, TResponse>,
    config?: InfiniteQuerySetConfig,
  ) =>
    new InfiniteQuerySet<TParams, TResponse, TDefaultError>(
      this,
      configurator,
      config,
    );

  /**
   * Создает набор мутаций для единого интерфейса с query sets
   * @param executor - Функция-исполнитель мутации. Она должна возвращать промис с результатом выполнения мутации.
   * @example
   * const editDocMutationSet = mobxQuery.createMutationSet((params: DocsDTO.EditDocInput) => {
   *   return docsEndpoints.editDoc(params);
   * });
   *
   * const editDocMutation = editDocMutationSet.create();
   *
   * editDocMutation.sync({ params: { id: 'docId', content: 'Новое содержимое' } });
   */
  public createMutationSet = <TResponse, TExecutorParams = void>(
    executor: MutationExecutor<TResponse, TExecutorParams>,
  ) =>
    new MutationSet<TResponse, TExecutorParams, TDefaultError>(this, executor);
}

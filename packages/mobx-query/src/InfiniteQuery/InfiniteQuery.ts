import { action, computed, makeObservable, when } from 'mobx';

import type { FetchPolicy, QueryBaseActions, Sync, SyncParams } from '../types';
import { AuxiliaryQuery } from '../AuxiliaryQuery';
import type { DataStorage } from '../DataStorage';
import { QueryContainer } from '../QueryContainer';
import { StatusStorage } from '../StatusStorage';

export const DEFAULT_INFINITE_ITEMS_COUNT = 30;

export type FetchMoreDirection = 'forward' | 'backward';

export type InfiniteFetchMoreOptions<TResult> = {
  /**
   * Направление для дозапроса данных
   * @default 'forward'
   */
  direction?: FetchMoreDirection;
  /**
   * Колбэк, вызываемый при успешном запросе, подразумевается использование, для запоминания последней успешной позиции
   */
  onSuccess?: (params: { offset: number; cursor: TResult }) => void;
};

export type InfiniteParams<TResult> = {
  /**
   * Смещение, от которого требуется сделать запрос
   * @default 0
   */
  offset: number;
  /**
   * Количество запрашиваемых элементов
   * @default 30
   */
  count: number;
  /**
   * Элемент использующийся в качестве точки отсчета при курсорной пагинации.
   * Передается в двух случаях: при fetchMore и первом запросе с initialCursor.
   */
  cursor?: Partial<TResult>;
  /**
   * Направление запроса, присутствует только при использовании fetchMore
   */
  direction?: FetchMoreDirection;
};

export type InfiniteDataStorage<TResult> = DataStorage<{
  data: TResult[];
  offset: number;
  isEndReached: boolean;
  isStartReached: boolean;
}>;

/**
 * Исполнитель запроса, ожидается,
 * что будет использоваться что-то возвращающее массив данных
 */
export type InfiniteExecutor<TResult> = (
  params: InfiniteParams<TResult>,
) => Promise<TResult[]>;

export type InfiniteQueryParams<
  TResult,
  TError,
  TIsBackground extends boolean = false,
> = {
  /**
   * Количество запрашиваемых элементов
   * @default 30
   */
  incrementCount?: number;
  /**
   * Смещение, от которого требуется сделать первый запрос
   * @default 0
   */
  initialOffset?: number;
  /**
   * Стартовый элемент, от которого требуется сделать первый запрос
   */
  initialCursor?: Partial<TResult>;
  /**
   * Обработчик ошибки, вызываемый по умолчанию
   */
  onError?: SyncParams<TResult, TError>['onError'];
  /**
   * Флаг, отвечающий за автоматический запрос данных при обращении к полю data
   */
  enabledAutoFetch?: boolean;
  /**
   * Инстанс хранилища основных статусов
   */
  statusStorage: StatusStorage<TError>;
  /**
   * Политика получения данных.
   * @enum cache-first - данные сначала берутся из кеша, если их нет, тогда идет обращение к сети, ответ записывается в кэш
   * @enum network-only - данные всегда берутся из сети, при этом ответ записывается в кэш
   */
  fetchPolicy?: FetchPolicy;
  /**
   * Инстанс хранилища данных
   */
  dataStorage: InfiniteDataStorage<TResult>;
  /**
   * Инстанс хранилища фоновых статусов
   */
  backgroundStatusStorage?: TIsBackground extends true
    ? StatusStorage<TError>
    : null | undefined;
  /**
   * Колбэк, вызываемый при успешном завершении запроса, подразумевается использование, для подтверждения валидности данных, чтобы квери не был удален из памяти
   */
  submitValidity?: () => void;
};

/**
 * Квери для работы с инфинити запросами,
 * которые должны быть закешированы,
 */
export class InfiniteQuery<
  TResult,
  TError = void,
  TIsBackground extends boolean = false,
>
  extends QueryContainer<
    TError,
    AuxiliaryQuery<TResult[], TError>,
    TIsBackground
  >
  implements QueryBaseActions<TResult[], TError>
{
  /**
   * Количество запрашиваемых элементов
   */
  private readonly incrementCount: number;

  /**
   * Хранилище данных, для обеспечения возможности синхронизации данных между разными инстансами
   */
  private storage: InfiniteDataStorage<TResult>;

  /**
   * Обработчик ошибки, вызываемый по умолчанию
   */
  private defaultOnError?: SyncParams<TResult, TError>['onError'];

  /**
   * Флаг, отвечающий за автоматический запрос данных при обращении к полю data
   */
  private enabledAutoFetch?: boolean;

  /**
   * Стандартное поведение политики кеширования
   */
  private readonly defaultFetchPolicy?: FetchPolicy;

  /**
   * Колбэк, вызываемый при успешном завершении запроса, подразумевается использование, для подтверждения валидности данных, чтобы квери не был удален из памяти
   */
  private readonly submitValidity?: () => void;

  /**
   * Хранилище статусов для процесса дозапроса данных
   */
  private fetchMoreStatusStorage = new StatusStorage<TError>();

  /**
   * Стартовое смещение для первого запроса
   */
  private initialOffset = 0;

  /**
   * Стартовый курсор для первого запроса
   */
  private initialCursor?: Partial<TResult>;

  constructor(
    private readonly executor: InfiniteExecutor<TResult>,
    {
      incrementCount = DEFAULT_INFINITE_ITEMS_COUNT,
      initialOffset = 0,
      initialCursor,
      onError,
      enabledAutoFetch,
      fetchPolicy,
      dataStorage,
      statusStorage,
      backgroundStatusStorage = null,
      submitValidity,
    }: InfiniteQueryParams<TResult, TError, TIsBackground>,
  ) {
    super(
      statusStorage,
      backgroundStatusStorage,
      new AuxiliaryQuery<TResult[], TError>(
        statusStorage,
        backgroundStatusStorage,
      ),
    );

    this.initialOffset = initialOffset;
    this.initialCursor = initialCursor;
    this.storage = dataStorage;
    this.incrementCount = incrementCount;
    this.defaultOnError = onError;
    this.enabledAutoFetch = enabledAutoFetch;
    this.defaultFetchPolicy = fetchPolicy;
    this.submitValidity = submitValidity;

    makeObservable(this as ThisType<this>, {
      fetchMoreStatus: computed,
      data: computed,
      computedData: computed,
      forceUpdate: action,
      async: action,
      sync: action,
      fetchMore: action,
      submitSuccess: action,
      isEndReached: computed,
      isStartReached: computed,
    });
  }

  private get isNetworkOnly() {
    return this.defaultFetchPolicy === 'network-only';
  }

  /**
   * Счетчик отступа для инфинити запроса
   */
  private get offset() {
    return this.storage.data?.offset ?? 0;
  }

  /**
   * Обработчик успешного запроса, проверяет что мы достигли предела
   */
  private submitSuccess = (
    result: TResult[],
    isLimitReached: boolean,
    isBackward = false,
  ) => {
    this.storage.setData((current) => ({
      offset: current?.offset ?? this.initialOffset,
      data: result,
      isEndReached: isBackward
        ? Boolean(current?.isEndReached)
        : isLimitReached,
      isStartReached: isBackward
        ? isLimitReached
        : Boolean(current?.isStartReached),
    }));

    this.submitValidity?.();
  };

  /**
   * Флаг того, что мы достигли предела запрашиваемых элементов
   */
  public get isEndReached() {
    return Boolean(this.storage.data?.isEndReached);
  }

  /**
   * Флаг того, что мы достигли самого начала запрашиваемых элементов
   */
  public get isStartReached() {
    return Boolean(this.storage.data?.isStartReached);
  }

  private calcIsLimitReachedByResult = (result: TResult[]) => {
    // убеждаемся что результат запроса действительно массив,
    // и если количество элементов в ответе меньше,
    // чем запрашивалось, значит у бэка их больше нет,
    // другими словами мы допускаем что, может произойти лишний запрос,
    // когда последняя отданная страница содержит ровно то количество,
    // сколько может содержать страница, а следующая уже просто пустая.
    if (Array.isArray(result) && result.length < this.incrementCount) {
      return true;
    }

    return false;
  };

  /**
   * Форс метод для установки данных
   */
  public forceUpdate = (
    param: TResult[] | ((data?: TResult[]) => TResult[]),
  ) => {
    this.auxiliary.submitSuccess();

    if (typeof param === 'function') {
      this.submitSuccess(
        (param as (data?: TResult[]) => TResult[])(this.storage.data?.data),
        this.isEndReached,
      );
    } else {
      this.submitSuccess(param, this.isEndReached);
    }
  };

  /**
   * Метод для обогащения параметров текущими значениями для инфинити
   */
  private makeInfiniteExecutor = (
    offset: number,
    cursor?: Partial<TResult>,
    direction?: FetchMoreDirection,
  ): (() => Promise<TResult[]>) => {
    return () =>
      this.executor({
        offset,
        count: this.incrementCount,
        cursor,
        direction,
      });
  };

  /**
   * Метод для инвалидации данных
   */
  public invalidate = () => {
    this.auxiliary.invalidate();
  };

  private setOffset = (offset: number) => {
    this.storage.setData((current) => ({
      offset,
      data: current?.data ?? [],
      isEndReached: Boolean(current?.isEndReached),
      isStartReached: Boolean(current?.isStartReached),
    }));
  };

  public get fetchMoreStatus() {
    return this.fetchMoreStatusStorage.statuses;
  }

  /**
   * Метод для запроса следующего набора данных
   */
  public fetchMore = (options?: InfiniteFetchMoreOptions<TResult>) => {
    const { direction = 'forward', onSuccess } = options ?? {};
    const isBackward = direction === 'backward';
    const isLimitReached = isBackward ? this.isStartReached : this.isEndReached;

    // если мы еще не достигли предела
    if (!isLimitReached && this.storage.data) {
      this.fetchMoreStatusStorage.setStartLoading();

      const offsetBeforeExecute = this.offset;
      const increment = (isBackward ? -1 : 1) * this.incrementCount;
      const cursor = isBackward
        ? this.data?.[0]
        : this.data?.[this.data.length - 1];
      // прибавляем к offset число запрашиваемых элементов
      const requestedOffset = Math.max(offsetBeforeExecute + increment, 0);

      this.setOffset(requestedOffset);

      // запускаем запрос с последними параметрами, и флагом необходимости инкремента
      this.auxiliary
        .getUnifiedPromise(
          this.makeInfiniteExecutor(requestedOffset, cursor, direction),
          (resData) => {
            this.fetchMoreStatusStorage.setSuccess();

            const currentData = this.storage.data?.data;
            const result = isBackward
              ? [...resData, ...(currentData ?? [])]
              : [...(currentData ?? []), ...resData];

            this.submitSuccess(
              result,
              this.calcIsLimitReachedByResult(resData),
              isBackward,
            );

            onSuccess?.({ offset: requestedOffset, cursor: cursor as TResult });
          },
        )
        .catch((e: TError) => {
          this.fetchMoreStatusStorage.setError(e);
          // в случае ошибки, откатываем значение offset к состоянию до дозапроса
          this.setOffset(offsetBeforeExecute);
          this.defaultOnError?.(e);
        })
        .finally(this.fetchMoreStatusStorage.setEndLoading);
    }
  };

  /**
   * Синхронный метод получения данных
   */
  public sync: Sync<TResult[], TError> = (params) => {
    const isInstanceAllow = !(this.isLoading || this.isSuccess);

    if (this.isNetworkOnly || this.auxiliary.isInvalid || isInstanceAllow) {
      this.proceedSync(params);

      return;
    }

    if (this.isSuccess) {
      params?.onSuccess?.(this.storage.data?.data as TResult[]);
    }
  };

  /**
   * Метод для переиспользования синхронной логики запроса
   */
  private proceedSync: Sync<TResult[], TError> = ({
    onSuccess,
    onError,
  } = {}) => {
    this.storage.setData((current) => ({
      offset: (this.isIdle && this.initialOffset) || 0,
      data: current?.data ?? [],
      isEndReached: false,
      isStartReached: false,
    }));

    this.auxiliary
      .getUnifiedPromise(
        this.makeInfiniteExecutor(
          this.offset,
          this.isIdle ? this.initialCursor : undefined,
        ),
        (resData) => {
          onSuccess?.(resData);
          this.submitSuccess(resData, this.calcIsLimitReachedByResult(resData));
        },
      )
      .catch((e: TError) => {
        if (!this.background) {
          this.storage.cleanData();
        }

        if (onError) {
          onError(e);
        } else {
          this.defaultOnError?.(e);
        }
      });
  };

  /**
   * Асинхронный метод получения данных,
   * подходит для изменения параметров запроса(фильтров),
   * при котором будет сброшен offset,
   * предполагается, что нужно будет самостоятельно обрабатывать ошибку
   */
  public async = () => {
    if (!this.isNetworkOnly && this.isSuccess && !this.auxiliary.isInvalid) {
      return Promise.resolve(this.storage.data?.data as TResult[]);
    }

    this.storage.setData((current) => ({
      offset: (this.isIdle && this.initialOffset) || 0,
      data: current?.data ?? [],
      isEndReached: false,
      isStartReached: false,
    }));

    return this.auxiliary.getUnifiedPromise(
      this.makeInfiniteExecutor(
        this.offset,
        this.isIdle ? this.initialCursor : undefined,
      ),
      (data) => this.submitSuccess(data, this.calcIsLimitReachedByResult(data)),
    );
  };

  private get computedData() {
    return this.storage.data?.data;
  }

  /**
   * Вычисляемое свойство, содержащее реактивные данные,
   * благодаря mobx, при изменении isInvalid, свойство будет вычисляться заново,
   * следовательно, стриггерится условие невалидности,
   * и начнется запрос, в результате которого, данные обновятся
   */
  public get data() {
    const shouldSync =
      this.enabledAutoFetch &&
      !this.isSuccess &&
      !this.isLoading &&
      !this.isError;

    if (this.auxiliary.isInvalid || shouldSync) {
      // т.к. при вызове апдейта, изменяются флаги, на которые подписан data,
      // нужно вызывать этот экшн асинхронно
      when(() => true, this.proceedSync);
    }

    // возвращаем имеющиеся данные
    return this.computedData;
  }
}

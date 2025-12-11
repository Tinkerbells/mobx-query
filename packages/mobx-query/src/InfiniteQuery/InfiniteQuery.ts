import { action, computed, makeObservable, when } from 'mobx';

import type { FetchPolicy, QueryBaseActions, Sync, SyncParams } from '../types';
import { AuxiliaryQuery } from '../AuxiliaryQuery';
import type { DataStorage } from '../DataStorage';
import { QueryContainer } from '../QueryContainer';
import { type StatusStorage } from '../StatusStorage';

export const DEFAULT_INFINITE_ITEMS_COUNT = 30;

export type InfiniteParams = {
  offset: number;
  count: number;
};

export type InfiniteDataStorage<TResult> = DataStorage<{
  data: TResult[];
  offset: number;
  isEndReached: boolean;
}>;

/**
 * Исполнитель запроса, ожидается,
 * что будет использоваться что-то возвращающее массив данных
 */
export type InfiniteExecutor<TResult> = (
  params: InfiniteParams,
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

  constructor(
    private readonly executor: InfiniteExecutor<TResult>,
    {
      incrementCount = DEFAULT_INFINITE_ITEMS_COUNT,
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

    this.storage = dataStorage;
    this.incrementCount = incrementCount;
    this.defaultOnError = onError;
    this.enabledAutoFetch = enabledAutoFetch;
    this.defaultFetchPolicy = fetchPolicy;
    this.submitValidity = submitValidity;

    makeObservable(this as ThisType<this>, {
      data: computed,
      computedData: computed,
      infiniteExecutor: computed,
      forceUpdate: action,
      async: action,
      sync: action,
      fetchMore: action,
      submitSuccess: action,
      isEndReached: computed,
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
  private submitSuccess = (result: TResult[], isEndReached: boolean) => {
    this.storage.setData((current) => ({
      offset: current?.offset,
      data: result,
      isEndReached,
    }));

    this.submitValidity?.();
  };

  /**
   * Флаг того, что мы достигли предела запрашиваемых элементов
   */
  public get isEndReached() {
    return Boolean(this.storage.data?.isEndReached);
  }

  private calcIsEndReachedByResult = (result: TResult[]) => {
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
  private get infiniteExecutor(): () => Promise<TResult[]> {
    return () =>
      this.executor({
        offset: this.offset,
        count: this.incrementCount,
      });
  }

  /**
   * Метод для инвалидации данных
   */
  public invalidate = () => {
    this.auxiliary.invalidate();
  };

  /**
   * Метод для запроса следующего набора данных
   */
  public fetchMore = () => {
    // если мы еще не достигли предела
    if (!this.isEndReached && this.storage.data) {
      // прибавляем к офсету число запрашиваемых элементов
      this.storage.setData((current) => ({
        offset: (current?.offset ?? 0) + this.incrementCount,
        data: current?.data,
        isEndReached: Boolean(current?.isEndReached),
      }));

      // запускаем запрос с последними параметрами, и флагом необходимости инкремента
      this.auxiliary
        .getUnifiedPromise(this.infiniteExecutor, (resData) => {
          this.submitSuccess(
            [...(this.storage.data?.data ?? []), ...resData],
            this.calcIsEndReachedByResult(resData),
          );
        })
        .catch((e: TError) => {
          this.defaultOnError?.(e);
        });
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
      offset: 0,
      data: current?.data,
      isEndReached: false,
    }));

    this.auxiliary
      .getUnifiedPromise(this.infiniteExecutor, (resData) => {
        onSuccess?.(resData);
        this.submitSuccess(resData, this.calcIsEndReachedByResult(resData));
      })
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
      offset: 0,
      data: current?.data,
      isEndReached: false,
    }));

    return this.auxiliary.getUnifiedPromise(this.infiniteExecutor, (data) =>
      this.submitSuccess(data, this.calcIsEndReachedByResult(data)),
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

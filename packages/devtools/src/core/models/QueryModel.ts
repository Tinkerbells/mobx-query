import { makeAutoObservable, runInAction } from 'mobx';

type QueryInstance = {
  data?: unknown;
  error?: unknown;
  isLoading?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  isEndReached?: boolean;
  background?: {
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
  } | null;
  sync?: () => void;
  invalidate?: () => void;
  fetchMore?: () => void;
  forceUpdate?: (payload: unknown) => void;
  statusStorage?: {
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    error: unknown;
  };
};

/**
 * ViewModel для конкретного Query/InfiniteQuery.
 * Дает UI доступ к состоянию и "хакерским" методам для отладки.
 */
export class QueryModel {
  public readonly hash: string;
  public readonly key: unknown[];
  private instance: QueryInstance;

  constructor(hash: string, key: unknown[], instance: QueryInstance) {
    this.hash = hash;
    this.key = key;
    this.instance = instance;

    makeAutoObservable(this, {}, { autoBind: true });
  }

  public updateInstance(instance: QueryInstance) {
    this.instance = instance;
  }

  get data() {
    return this.instance?.data;
  }

  get error() {
    return this.instance?.error;
  }

  get isLoading() {
    return Boolean(this.instance?.isLoading);
  }

  get isSuccess() {
    return Boolean(this.instance?.isSuccess);
  }

  get isError() {
    return Boolean(this.instance?.isError);
  }

  get isEndReached() {
    return this.instance?.isEndReached;
  }

  get background() {
    return this.instance?.background ?? null;
  }

  get isStale() {
    // mobx-query не имеет концепции stale
    // Считаем query stale, если есть данные но нет loading и success
    return this.hasData && !this.isLoading && !this.isSuccess;
  }

  get hasData() {
    return this.instance?.data !== undefined;
  }

  get updatedAt() {
    // mobx-query не хранит время обновления
    return null;
  }

  get type(): 'query' | 'infinite' | 'mutation' {
    if (this.instance && 'fetchMore' in this.instance) {
      return 'infinite';
    }

    if (this.instance && 'data' in this.instance) {
      return 'query';
    }

    return 'mutation';
  }

  public refetch() {
    if (typeof this.instance?.sync === 'function') {
      this.instance.sync();
    }
  }

  public fetchMore() {
    if (typeof this.instance?.fetchMore === 'function') {
      this.instance.fetchMore();
    }
  }

  public invalidate() {
    if (typeof this.instance?.invalidate === 'function') {
      this.instance.invalidate();
    }
  }

  public setIsLoading(loading: boolean) {
    const status = (this.instance as { statusStorage?: QueryInstance['statusStorage'] })?.statusStorage;

    if (!status) return;

    runInAction(() => {
      status.isLoading = loading;
      if (loading) {
        status.isError = false;
        status.isSuccess = false;
      }
    });
  }

  public setData(newData: unknown) {
    if (typeof this.instance?.forceUpdate === 'function') {
      this.instance.forceUpdate(newData);
    }
  }

  public setIsSuccess(success: boolean) {
    const status = (this.instance as { statusStorage?: QueryInstance['statusStorage'] })?.statusStorage;

    if (!status) return;

    runInAction(() => {
      status.isSuccess = success;
      if (success) {
        status.isError = false;
        status.isLoading = false;
      }
    });
  }

  public setIsError(isError: boolean) {
    const status = (this.instance as { statusStorage?: QueryInstance['statusStorage'] })?.statusStorage;

    if (!status) return;

    runInAction(() => {
      status.isError = isError;
      if (isError) {
        status.isSuccess = false;
        status.isLoading = false;
      }
    });
  }

  public setError(error: unknown) {
    const status = (this.instance as { statusStorage?: QueryInstance['statusStorage'] })?.statusStorage;

    if (!status) return;

    runInAction(() => {
      status.isError = true;
      status.error = error;
      status.isLoading = false;
      status.isSuccess = false;
    });
  }
}

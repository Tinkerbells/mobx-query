import { makeAutoObservable } from 'mobx';

import { StorageFactory } from '../StorageFactory';

export class StatusStorage<TError> {
  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Флаг обозначающий загрузку данных
   */
  public isLoading: boolean = false;

  /**
   * Флаг обозначающий, что последний запрос был зафейлен
   */
  public isError: boolean = false;

  /**
   * Данные о последней ошибке
   */
  public error?: TError = undefined;

  /**
   * Флаг, обозначающий успешность завершения последнего запроса
   */
  public isSuccess = false;

  public setStatues = (data: {
    isLoading: boolean;
    isError: boolean;
    error?: TError;
    isSuccess: boolean;
  }) => {
    this.isLoading = data.isLoading;
    this.isError = data.isError;
    this.error = data.error;
    this.isSuccess = data.isSuccess;
  };

  public get statuses() {
    return {
      isLoading: this.isLoading,
      isError: this.isError,
      error: this.error,
      isSuccess: this.isSuccess,
    };
  }
}

export class StatusStorageFactory extends StorageFactory<StatusStorage<void>> {
  constructor() {
    super(() => new StatusStorage());
  }

  public getStorage = <TError>(keyHash: string) => {
    return this.getInternalStorage(keyHash) as StatusStorage<TError>;
  };
}

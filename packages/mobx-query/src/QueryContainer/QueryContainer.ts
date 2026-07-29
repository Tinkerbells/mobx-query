import { action, computed, makeObservable, observable } from 'mobx';

import { type StatusStorage } from '../StatusStorage';
import type { MobxQueryDevtoolsOverride } from '../types';

export type QueryContainerAuxiliary = {
  isIdle: boolean;
};

type Statuses<TError> = Pick<
  StatusStorage<TError>,
  'error' | 'isError' | 'isLoading' | 'isSuccess'
>;

/**
 * Контейнер для бойлерплейт части,
 * позволяет не повторять в каждом наследуемом классе использование стандартных статусов
 */
export abstract class QueryContainer<
  TError,
  TAuxiliary extends QueryContainerAuxiliary,
  TIsBackground extends boolean,
> implements Statuses<TError> {
  private devtoolsOverride: MobxQueryDevtoolsOverride<TError> | null = null;

  protected constructor(
    private readonly statusStorage: StatusStorage<TError>,
    private readonly backgroundStatusStorage: StatusStorage<TError> | null,
    protected readonly auxiliary: TAuxiliary,
  ) {
    makeObservable(this, {
      devtoolsOverride: observable.ref,
      clearDevtoolsOverride: action,
      error: computed,
      hasDevtoolsOverride: computed,
      isError: computed,
      isIdle: computed,
      isLoading: computed,
      isSuccess: computed,
      setDevtoolsOverride: action,
      status: computed,
    });
  }

  /** Applies a DevTools-only status override until `clearDevtoolsOverride`. */
  public setDevtoolsOverride = (
    override: MobxQueryDevtoolsOverride<TError>,
  ) => {
    this.devtoolsOverride = override;
  };

  /** Restores the state produced by the query's real executor. */
  public clearDevtoolsOverride = () => {
    this.devtoolsOverride = null;
  };

  public get hasDevtoolsOverride() {
    return this.devtoolsOverride !== null;
  }

  /**
   * Флаг загрузки данных
   */
  public get isLoading() {
    return this.devtoolsOverride?.isLoading ?? this.statusStorage.isLoading;
  }

  /**
   * Флаг обозначающий, что последний запрос был зафейлен
   */
  public get isError() {
    return this.devtoolsOverride?.isError ?? this.statusStorage.isError;
  }

  /**
   * Данные о последней ошибке
   */
  public get error() {
    return this.devtoolsOverride?.error ?? this.statusStorage.error;
  }

  /**
   * Флаг обозначающий, что последний запрос был успешно завершен
   */
  public get isSuccess() {
    return this.devtoolsOverride?.isSuccess ?? this.statusStorage.isSuccess;
  }

  /**
   * Флаг, обозначающий простаивание, т.е. запроса еще не было
   */
  public get isIdle() {
    return this.devtoolsOverride?.isIdle ?? this.auxiliary.isIdle;
  }

  public get status() {
    return {
      isLoading: this.isLoading,
      isError: this.isError,
      error: this.error,
      isSuccess: this.isSuccess,
      isIdle: this.isIdle,
    };
  }

  /**
   * Статусы, изменяющиеся после первого успешного запроса в режиме isBackground: true
   * @example
   * const query = mobxQuery.createQuery(
   *     ['some cache key'],
   *     () => Promise.resolve('foo'),
   *     { isBackground: true }
   * );
   *
   * await query.async();
   * console.log(query.isLoading); // переключался в true на момент запроса
   * console.log(query.isSuccess); // true
   *
   * query.invalidate();
   * await query.async();
   * console.log(query.isLoading); // не изменялся
   * console.log(query.isSuccess); // остался неизменным - true
   *
   * console.log(query.background.isLoading); // переключался в true на момент обновления
   * console.log(query.background.isSuccess); // true
   *
   * @exception isBackground:false (а так же по умолчанию) background не доступен, и равен null
   * @exception Mutation не доступен в мутации и равен null
   */
  public get background(): TIsBackground extends true
    ? Statuses<TError>
    : null {
    if (!this.backgroundStatusStorage) {
      return null as never;
    }

    return this.backgroundStatusStorage as unknown as TIsBackground extends true
      ? Statuses<TError>
      : null;
  }
}

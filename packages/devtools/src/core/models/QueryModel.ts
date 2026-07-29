import { makeAutoObservable } from 'mobx'
import type {
  MobxQueryDevtoolsEntry,
  MobxQueryDevtoolsQuery,
  MobxQueryDevtoolsState,
  MobxQueryDevtoolsMeta,
} from '@tinkerbells88/mobx-query'

/** View model used by the TanStack-compatible presentation layer. */
export class QueryModel {
  public readonly hash: string
  public readonly key: unknown[]
  private typeValue: MobxQueryDevtoolsEntry['type']
  private query: MobxQueryDevtoolsQuery
  private metaValue: MobxQueryDevtoolsMeta

  constructor(
    hash: string,
    key: unknown[],
    type: MobxQueryDevtoolsEntry['type'],
    query: MobxQueryDevtoolsQuery,
    meta: MobxQueryDevtoolsMeta,
  ) {
    this.hash = hash
    this.key = key
    this.typeValue = type
    this.query = query
    this.metaValue = meta
    makeAutoObservable(this, {}, { autoBind: true })
  }

  public updateQuery(
    query: MobxQueryDevtoolsQuery,
    type: MobxQueryDevtoolsEntry['type'],
    meta: MobxQueryDevtoolsMeta,
  ) {
    this.query = query
    this.typeValue = type
    this.metaValue = meta
  }

  private get state() {
    return this.query.getDevtoolsState()
  }

  get data() {
    return this.state.data
  }

  get error() {
    return this.state.error
  }

  get isLoading() {
    return this.state.isLoading
  }

  get isSuccess() {
    return this.state.isSuccess
  }

  get isError() {
    return this.state.isError
  }

  get isIdle() {
    return this.state.isIdle
  }

  get isEndReached() {
    return this.state.isEndReached
  }

  get background() {
    return this.state.background
  }

  get hasData() {
    return this.data !== undefined
  }

  get isStale() {
    return false
  }

  get updatedAt() {
    return null
  }

  get type() {
    return this.typeValue
  }

  get meta() {
    return this.metaValue
  }

  public refetch() {
    if (this.type !== 'mutation') {
      // `sync()` intentionally returns cached data for cache-first queries.
      // A DevTools refetch must always request fresh data, like TanStack's
      // refetch action, so invalidate before starting the executor.
      this.query.invalidate?.()
      this.query.sync?.()
    }
  }

  public fetchMore() {
    if (this.type === 'infinite') this.query.fetchMore?.()
  }

  public invalidate() {
    if (this.type !== 'mutation') this.query.invalidate?.()
  }

  public setData(data: unknown) {
    if (this.type === 'infinite' && !Array.isArray(data)) {
      throw new TypeError('Infinite query data must be an array')
    }
    this.query.forceUpdate?.(data)
  }

  public setDevtoolsState(state: Partial<MobxQueryDevtoolsState>) {
    const current = this.state
    this.query.setDevtoolsOverride?.({
      isLoading: state.isLoading ?? current.isLoading,
      isSuccess: state.isSuccess ?? current.isSuccess,
      isError: state.isError ?? current.isError,
      isIdle: state.isIdle ?? current.isIdle,
      error: state.error ?? current.error,
    })
  }

  public clearDevtoolsState() {
    this.query.clearDevtoolsOverride?.()
  }

  public setIsLoading(value: boolean) {
    this.setDevtoolsState({
      isLoading: value,
      ...(value
        ? { isIdle: false, isSuccess: false, isError: false, error: undefined }
        : {}),
    })
  }

  public setIsSuccess(value: boolean) {
    this.setDevtoolsState({
      isSuccess: value,
      ...(value
        ? { isIdle: false, isLoading: false, isError: false, error: undefined }
        : {}),
    })
  }

  public setIsError(value: boolean) {
    this.setDevtoolsState({
      isError: value,
      ...(value ? { isIdle: false, isLoading: false, isSuccess: false } : {}),
    })
  }

  public setError(error: unknown) {
    this.setDevtoolsState({ error, isIdle: false, isLoading: false, isSuccess: false, isError: true })
  }
}

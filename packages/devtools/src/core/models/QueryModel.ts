import { makeAutoObservable } from 'mobx'
import type {
  MobxQueryDevtoolsEntry,
  MobxQueryDevtoolsQuery,
} from '@tinkerbells88/mobx-query'

/** View model used by the TanStack-compatible presentation layer. */
export class QueryModel {
  public readonly hash: string
  public readonly key: unknown[]
  private typeValue: MobxQueryDevtoolsEntry['type']
  private query: MobxQueryDevtoolsQuery

  constructor(
    hash: string,
    key: unknown[],
    type: MobxQueryDevtoolsEntry['type'],
    query: MobxQueryDevtoolsQuery,
  ) {
    this.hash = hash
    this.key = key
    this.typeValue = type
    this.query = query
    makeAutoObservable(this, {}, { autoBind: true })
  }

  public updateQuery(
    query: MobxQueryDevtoolsQuery,
    type: MobxQueryDevtoolsEntry['type'],
  ) {
    this.query = query
    this.typeValue = type
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

  public refetch() {
    if (this.type !== 'mutation') this.query.sync?.()
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

  // The TanStack-compatible UI exposes these controls. Mobx Query has no safe
  // public equivalent, so they intentionally remain read-only.
  public setIsLoading(_value: boolean) {}
  public setIsSuccess(_value: boolean) {}
  public setIsError(_value: boolean) {}
  public setError(_value: unknown) {}
}

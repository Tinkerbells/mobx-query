import { DevToolsAdapter } from './core/adapter'
import { QueryModel } from './core/models/QueryModel'
import type {
  FetchStatus,
  Mutation,
  MutationCache,
  OnlineManager,
  Query,
  QueryCache,
  QueryCacheNotifyEvent,
  QueryClient,
  QueryState,
  QueryStatus,
} from './tanstack/types'

class QueryProxy implements Query {
  private model: QueryModel
  private lastUpdatedAt: number
  private prevData: unknown
  private prevError: unknown

  constructor(model: QueryModel) {
    this.model = model
    this.prevData = model.data
    this.prevError = model.error
    this.lastUpdatedAt = Date.now()
  }

  public refresh(instance: unknown) {
    this.model.updateInstance(instance as never)
    if (this.prevData !== this.model.data || this.prevError !== this.model.error) {
      this.lastUpdatedAt = Date.now()
      this.prevData = this.model.data
      this.prevError = this.model.error
    }
  }

  get queryHash() {
    return this.model.hash
  }

  get queryKey() {
    return this.model.key
  }

  get state(): QueryState {
    return {
      data: this.model.data as never,
      dataUpdatedAt: this.lastUpdatedAt,
      error: (this.model.error as never) ?? null,
      fetchFailureCount: 0,
      fetchMeta: null,
      status: this.model.isError
        ? 'error'
        : this.model.isSuccess
          ? 'success'
          : 'pending',
      fetchStatus: this.model.isLoading ? 'fetching' : 'idle',
    }
  }

  setState(nextState: Partial<QueryState>) {
    if (nextState.data !== undefined) {
      this.model.setData(nextState.data)
    }
    if (nextState.error !== undefined && nextState.error !== null) {
      this.model.setError(nextState.error)
    }
    if (nextState.status) {
      this.applyStatus(nextState.status)
    }
    if (nextState.fetchStatus) {
      this.applyFetchStatus(nextState.fetchStatus)
    }
  }

  private applyStatus(status: QueryStatus) {
    if (status === 'error') {
      this.model.setIsError(true)
    } else if (status === 'success') {
      this.model.setIsSuccess(true)
    } else {
      this.model.setIsLoading(true)
    }
  }

  private applyFetchStatus(status: FetchStatus) {
    if (status === 'fetching') {
      this.model.setIsLoading(true)
      return
    }
    if (status === 'paused') return
    this.model.setIsLoading(false)
  }

  isStale() {
    return this.model.isStale
  }

  isDisabled() {
    return false
  }

  isFetching() {
    return this.model.isLoading
  }

  isPaused() {
    return false
  }

  isInvalidated() {
    return false
  }

  isActive() {
    return this.model.isLoading || this.model.hasData
  }

  fetch(options?: any) {
    this.model.refetch()
    return Promise.resolve(options)
  }

  fetchOptimistic(options?: any) {
    return this.fetch(options)
  }

  cancel() {
    this.model.setIsLoading(false)
  }

  invalidate() {
    this.model.invalidate()
  }

  reset() {
    this.model.setData(undefined)
    this.model.setIsError(false)
    this.model.setIsSuccess(false)
    this.model.setIsLoading(false)
  }

  getObserversCount() {
    return 1
  }

  getObservers() {
    return []
  }

  get options() {
    return {}
  }
}

class MobxQueryCache implements QueryCache {
  private readonly adapter: DevToolsAdapter
  private readonly listeners = new Set<(event: QueryCacheNotifyEvent) => void>()
  private syncTimer?: number
  private proxies = new Map<string, QueryProxy>()
  private keyIndex = new Map<string, QueryProxy>()

  constructor(adapter: DevToolsAdapter) {
    this.adapter = adapter
    this.sync()
    this.syncTimer = window.setInterval(() => this.sync(), 1000)
  }

  private sync() {
    const snapshots = this.adapter.list()
    const next = new Map<string, QueryProxy>()
    const nextKeyIndex = new Map<string, QueryProxy>()

    snapshots.forEach(({ hash, key, instance }) => {
      const existing = this.proxies.get(hash)
      if (existing) {
        existing.refresh(instance)
        next.set(hash, existing)
        nextKeyIndex.set(MobxQueryCache.signature(existing.queryKey), existing)
        this.notify({ type: 'queryUpdated', query: existing })
        return
      }

      const proxy = new QueryProxy(new QueryModel(hash, key, instance as never))
      next.set(hash, proxy)
      nextKeyIndex.set(MobxQueryCache.signature(proxy.queryKey), proxy)
      this.notify({ type: 'queryAdded', query: proxy })
    })

    for (const [hash, proxy] of this.proxies.entries()) {
      if (!next.has(hash)) {
        this.notify({ type: 'queryRemoved', query: proxy })
      }
    }

    this.proxies = next
    this.keyIndex = nextKeyIndex
  }

  getAll() {
    return Array.from(this.proxies.values())
  }

  find(filters: { queryHash?: string; queryKey?: unknown }) {
    if (filters.queryHash) {
      return this.proxies.get(filters.queryHash)
    }
    if (filters.queryKey) {
      const signature = MobxQueryCache.signature(filters.queryKey)
      const indexed = this.keyIndex.get(signature)
      if (indexed) return indexed
      for (const proxy of this.proxies.values()) {
        // fast path: same reference
        if (proxy.queryKey === filters.queryKey) return proxy
        if (deepEqual(proxy.queryKey, filters.queryKey)) return proxy
      }
      const first = this.proxies.values().next()
      if (!first.done) return first.value
    }
    return undefined
  }

  subscribe(listener: (event: QueryCacheNotifyEvent) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  destroy() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
      this.syncTimer = undefined
    }
    this.listeners.clear()
    this.proxies.clear()
  }

  private notify(event: QueryCacheNotifyEvent) {
    for (const listener of this.listeners) {
      listener(event)
    }
  }

  private static signature(key: unknown): string {
    if (key === undefined) return 'undefined'
    if (key === null) return 'null'

    try {
      return JSON.stringify(key)
    } catch {
      // fallback for circular/non-serializable keys
      if (Array.isArray(key)) {
        return `arr:${key.map((item) => this.signature(item)).join('|')}`
      }
      if (typeof key === 'object') {
        const entries = Object.entries(key as Record<string, unknown>)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => `${k}:${this.signature(v)}`)
        return `obj:${entries.join('|')}`
      }
      return String(key)
    }
  }
}

class EmptyMutationCache implements MutationCache {
  getAll(): Mutation[] {
    return []
  }

  subscribe(listener: () => void) {
    const disposer = () => { }
    return disposer
  }
}

class MobxOnlineManager implements OnlineManager {
  private listeners = new Set<(online: boolean) => void>()
  private online = true

  subscribe(listener: (online: boolean) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  setOnline(next: boolean) {
    this.online = next
    this.listeners.forEach((l) => l(this.online))
  }

  isOnline() {
    return this.online
  }
}

class MobxQueryClient implements QueryClient {
  private readonly queryCache: MobxQueryCache
  private readonly mutationCache = new EmptyMutationCache()

  constructor(adapter: DevToolsAdapter) {
    this.queryCache = new MobxQueryCache(adapter)
  }

  getQueryCache() {
    return this.queryCache
  }

  getMutationCache() {
    return this.mutationCache
  }

  setQueryData(queryKey: unknown, data: unknown) {
    const query = this.queryCache.find({ queryKey })
    if (!query) return

    // setState delegates to QueryModel.setData, which calls underlying forceUpdate
    query.setState({ data })
  }

  invalidateQueries(query?: Query | undefined) {
    if (query) query.invalidate?.()
    else this.queryCache.getAll().forEach((q) => q.invalidate?.())
  }

  resetQueries(query?: Query | undefined) {
    if (query) query.reset?.()
    else this.queryCache.getAll().forEach((q) => q.reset?.())
  }

  removeQueries(query?: Query | undefined) {
    if (!query) return
    if ('queryHash' in query) {
      // Removal will be reflected on next sync when instance disappears
      query.reset?.()
    }
  }

  destroy() {
    this.queryCache.destroy()
  }
}

export { MobxQueryClient, MobxOnlineManager }

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false
    }
    return true
  }

  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const aKeys = Object.keys(a as Record<string, unknown>)
    const bKeys = Object.keys(b as Record<string, unknown>)
    if (aKeys.length !== bKeys.length) return false
    for (const key of aKeys) {
      if (
        !deepEqual(
          (a as Record<string, unknown>)[key],
          (b as Record<string, unknown>)[key],
        )
      ) {
        return false
      }
    }
    return true
  }

  return false
}

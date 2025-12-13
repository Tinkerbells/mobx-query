import { createMemo, onCleanup } from 'solid-js'
import { autorun } from 'mobx'

import type { DevToolsStore } from '../../core/store'
import { DevtoolsComponent } from '../../tanstack'
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
} from '../../tanstack/types'
import type { QueryModel } from '../../core/models/QueryModel'

interface Props {
  store: DevToolsStore
  shadowRoot?: ShadowRoot | null
}

export default function MobxQueryDevTools(props: Props) {
  const bridge = createMemo(() => createClientFromStore(props.store))

  onCleanup(() => {
    bridge().client.destroy()
  })

  return (
    <DevtoolsComponent
      client={bridge().client}
      queryFlavor="mobx-query"
      version="0.1.0"
      onlineManager={bridge().onlineManager}
      shadowDOMTarget={props.shadowRoot as any}
    />
  )
}

// --- bridge to satisfy tanstack UI contracts using DevToolsStore data ---

class StoreQuery implements Query {
  private model: QueryModel
  private lastUpdatedAt: number
  private prevData: unknown
  private prevError: unknown
  private _fetchMeta: any = null  // ← Добавляем хранилище для fetchMeta

  constructor(model: QueryModel) {
    this.model = model
    this.prevData = model.data
    this.prevError = model.error
    this.lastUpdatedAt = Date.now()
  }

  refresh(model: QueryModel) {
    this.model = model
    if (this.prevData !== model.data || this.prevError !== model.error) {
      this.lastUpdatedAt = Date.now()
      this.prevData = model.data
      this.prevError = model.error
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
      fetchMeta: this._fetchMeta,  // ← Используем сохраненное значение
      // Правильный маппинг mobx-query статусов:
      // isError -> 'error'
      // isSuccess -> 'success'
      // isIdle | isLoading -> 'pending'
      status: this.model.isError
        ? 'error'
        : this.model.isSuccess
          ? 'success'
          : 'pending',
      // fetchStatus показывает текущее состояние запроса
      // В mobx-query есть только isLoading, нет 'paused'
      fetchStatus: this.model.isLoading ? 'fetching' : 'idle',
    }
  }

  // mobx-query специфичное свойство - фоновый запрос
  get background() {
    return this.model.background
  }

  // mobx-query InfiniteQuery специфичное свойство - конец списка достигнут
  get isEndReached() {
    return this.model.isEndReached ?? false
  }

  setState(nextState: Partial<QueryState>) {
    console.log('[setState] called', {
      queryHash: this.queryHash,
      hasData: 'data' in nextState,
      hasStatus: !!nextState.status,
      hasFetchMeta: 'fetchMeta' in nextState,
      currentData: this.model.data,
      newData: nextState.data,
    })

    // Изменение данных - используем setData (вызывает forceUpdate на instance)
    // ВАЖНО: проверяем наличие ключа 'data', а не значение (может быть undefined)
    if ('data' in nextState) {
      console.log('[setState] calling setData')
      this.model.setData(nextState.data)
      console.log('[setState] setData completed, new model.data:', this.model.data)
    }
    // Изменение ошибки
    if (nextState.error !== undefined && nextState.error !== null) {
      this.model.setError(nextState.error)
    }
    // Изменение статусов
    if (nextState.status) {
      this.applyStatus(nextState.status)
    }
    // Изменение fetchStatus
    if (nextState.fetchStatus) {
      this.applyFetchStatus(nextState.fetchStatus)
    }
    // Изменение fetchMeta
    if ('fetchMeta' in nextState) {
      this._fetchMeta = nextState.fetchMeta
    }
  }

  private applyStatus(status: QueryStatus) {
    if (status === 'error') {
      this.model.setIsError(true)
    } else if (status === 'success') {
      this.model.setIsSuccess(true)
    } else {
      // 'pending' - устанавливаем loading
      this.model.setIsLoading(true)
    }
  }

  private applyFetchStatus(status: FetchStatus) {
    if (status === 'fetching') {
      this.model.setIsLoading(true)
    } else if (status === 'paused') {
      // mobx-query НЕ поддерживает paused
      // no-op
    } else {
      // 'idle' - останавливаем loading
      this.model.setIsLoading(false)
    }
  }

  // mobx-query НЕ имеет концепции stale time - данные актуальны до invalidate()
  isStale() {
    return false
  }
  // mobx-query НЕ имеет disabled queries
  isDisabled() {
    return false
  }
  isFetching() {
    return this.model.isLoading
  }
  // mobx-query НЕ имеет paused queries
  isPaused() {
    return false
  }
  // mobx-query имеет метод invalidate(), но НЕ имеет флага isInvalidated
  isInvalidated() {
    return false
  }
  isActive() {
    return this.model.isLoading || this.model.hasData
  }
  // mobx-query НЕ имеет static queries
  isStatic() {
    return false
  }
  // mobx-query специфичный метод - query не был выполнен
  // isIdle = не было данных И не loading И не success И не error
  isIdle() {
    return !this.model.hasData &&
      !this.model.isLoading &&
      !this.model.isSuccess &&
      !this.model.isError
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

class StoreQueryCache implements QueryCache {
  private readonly store: DevToolsStore
  private readonly listeners = new Set<(event: QueryCacheNotifyEvent) => void>()
  private proxies = new Map<string, StoreQuery>()
  private disposeAutorun: () => void
  private isUpdatingFromDevtools = false  // Флаг для предотвращения обратной синхронизации

  constructor(store: DevToolsStore) {
    this.store = store
    this.disposeAutorun = autorun(() => {
      if (this.isUpdatingFromDevtools) {
        return
      }


      this.store.queries.forEach((model) => {
        model.hash
        model.key
        model.data
        model.error
        model.isLoading
        model.isError
        model.isSuccess
        model.isStale
      })

      this.sync()
    })
  }

  setUpdatingFromDevtools(next: boolean) {
    this.isUpdatingFromDevtools = next
  }

  private sync() {
    const next = new Map<string, StoreQuery>()
    const models = this.store.queries

    models.forEach((model) => {
      const existing = this.proxies.get(model.hash)
      if (existing) {
        existing.refresh(model)
        next.set(model.hash, existing)
        this.notify({ type: 'queryUpdated', query: existing })
        return
      }
      const proxy = new StoreQuery(model)
      next.set(model.hash, proxy)
      this.notify({ type: 'queryAdded', query: proxy })
    })

    for (const [hash, proxy] of this.proxies.entries()) {
      if (!next.has(hash)) {
        this.notify({ type: 'queryRemoved', query: proxy })
      }
    }

    this.proxies = next
  }

  getAll() {
    return Array.from(this.proxies.values())
  }

  find(filters: { queryHash?: string; queryKey?: unknown }) {
    if (filters.queryHash) {
      return this.proxies.get(filters.queryHash)
    }
    if (filters.queryKey) {
      for (const proxy of this.proxies.values()) {
        if (deepEqual(proxy.queryKey, filters.queryKey)) return proxy
      }
    }
    return undefined
  }

  subscribe(listener: (event: QueryCacheNotifyEvent) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  destroy() {
    this.disposeAutorun?.()
    this.listeners.clear()
    this.proxies.clear()
  }

  clear() {
    for (const proxy of this.proxies.values()) {
      this.notify({ type: 'queryRemoved', query: proxy })
    }
    this.proxies.clear()
  }

  private notify(event: QueryCacheNotifyEvent) {
    for (const listener of this.listeners) {
      listener(event)
    }
  }
}

class EmptyMutationCache implements MutationCache {
  getAll(): Mutation[] {
    return []
  }
  subscribe() {
    return () => { }
  }
  clear() { }
}

class StubOnlineManager implements OnlineManager {
  private listeners = new Set<(online: boolean) => void>()
  private online = true
  subscribe(listener: (online: boolean) => void) {
    this.listeners.add(listener)
    // notify immediately with current state
    listener(this.online)
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

class StoreQueryClient implements QueryClient {
  private readonly queryCache: StoreQueryCache
  private readonly mutationCache = new EmptyMutationCache()
  private updateTimeouts = new Map<string, number>()

  constructor(store: DevToolsStore) {
    this.queryCache = new StoreQueryCache(store)
  }
  getQueryCache() {
    return this.queryCache
  }
  getMutationCache() {
    return this.mutationCache
  }
  // Метод для изменения данных query (используется в Explorer.tsx)
  setQueryData(queryKey: unknown, data: unknown) {
    const query = this.queryCache.find({ queryKey })
    if (!query) return

    const queryHash = query.queryHash
    const scheduled = this.updateTimeouts.get(queryHash)
    if (scheduled) {
      clearTimeout(scheduled)
    }

    const timeoutId = window.setTimeout(() => {
      this.queryCache.setUpdatingFromDevtools(true)
      try {
        query.setState({ data })
      } finally {
        window.setTimeout(
          () => this.queryCache.setUpdatingFromDevtools(false),
          100,
        )
      }
      this.updateTimeouts.delete(queryHash)
    }, 50)

    this.updateTimeouts.set(queryHash, timeoutId)
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
    query.reset?.()
  }
  clear() {
    this.queryCache.clear?.()
    this.mutationCache.clear?.()
  }
  destroy() {
    this.queryCache.destroy()
  }
}

function createClientFromStore(store: DevToolsStore) {
  const client = new StoreQueryClient(store)
  const onlineManager = new StubOnlineManager()
  return { client, onlineManager }
}

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
      if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) {
        return false
      }
    }
    return true
  }
  return false
}

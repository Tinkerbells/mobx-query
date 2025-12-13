export type QueryStatus = 'pending' | 'success' | 'error'
export type FetchStatus = 'idle' | 'fetching' | 'paused'

export interface QueryState<TData = unknown, TError = unknown> {
  data: TData | undefined
  dataUpdatedAt: number
  error: TError | null
  fetchFailureCount: number
  fetchMeta: unknown
  status: QueryStatus
  fetchStatus: FetchStatus
}

export interface Query {
  queryHash: string
  queryKey: unknown[]
  state: QueryState
  isStale(): boolean
  isDisabled(): boolean
  isFetching(): boolean
  isPaused(): boolean
  isInvalidated(): boolean
  isActive(): boolean
  isStatic?(): boolean
  fetch(options?: any): Promise<unknown> | void
  fetchOptimistic?(options?: any): Promise<unknown>
  setState(state: Partial<QueryState>): void
  cancel?(options?: any): void
  invalidate?(): void
  reset?(): void
  getObserversCount(): number
  getObservers(): any[]
  options?: any
}

export type QueryCacheNotifyEvent = { type: string; query?: Query }

export interface QueryCache {
  getAll(): Query[]
  find(filters: { queryHash?: string; queryKey?: unknown }): Query | undefined
  subscribe(listener: (event: QueryCacheNotifyEvent) => void): () => void
  clear?(): void
}

export type MutationStatus = 'pending' | 'success' | 'error' | 'idle'

export interface MutationState<TData = unknown, TError = unknown> {
  status: MutationStatus
  data?: TData
  error?: TError
  variables?: unknown
  context?: unknown
  submittedAt: number
  isPaused?: boolean
}

export interface Mutation {
  mutationId: number
  options: { mutationKey?: unknown }
  state: MutationState
}

export interface MutationCache {
  getAll(): Mutation[]
  subscribe(listener: () => void): () => void
  clear?(): void
}

export interface QueryClient {
  getQueryCache(): QueryCache
  getMutationCache(): MutationCache
  setQueryData(queryKey: unknown, data: unknown): void
  invalidateQueries(query?: Query): void
  resetQueries(query?: Query): void
  removeQueries(query?: Query): void
}

export interface OnlineManager {
  subscribe(listener: (online: boolean) => void): () => void
  setOnline(online: boolean): void
  isOnline(): boolean
}

import { render } from 'solid-js/web'
import { MobxQuery } from '@tinkerbells/mobx-query'
import { makeAutoObservable } from 'mobx'
import { For, Show, createEffect, createSignal, onCleanup } from 'solid-js'

import App from './App'
import { mountMobxQueryDevtools } from './index'
import { setupMobxSolid } from './mobxSolid'
import './style.css'

setupMobxSolid()

const BASE_URL = 'https://jsonplaceholder.typicode.com'

const cacheService = new MobxQuery({ enabledAutoFetch: false })

interface User {
  id: number
  name: string
  username: string
  email: string
  phone: string
  website: string
}

interface Post {
  id: number
  userId: number
  title: string
  body: string
}

interface Comment {
  id: number
  postId: number
  name: string
  email: string
  body: string
}

interface Todo {
  id: number
  userId: number
  title: string
  completed: boolean
}

const api = {
  queries: {
    user: cacheService.createQuerySet((userId: number) => ({
      keys: ['user', userId],
      execute: async () => {
        const response = await fetch(`${BASE_URL}/users/${userId}`)
        if (!response.ok) throw new Error('Failed to fetch user')
        return response.json() as Promise<User>
      },
    })),
    post: cacheService.createQuerySet((postId: number) => ({
      keys: ['post', postId],
      execute: async () => {
        const response = await fetch(`${BASE_URL}/posts/${postId}`)
        if (!response.ok) throw new Error('Failed to fetch post')
        return response.json() as Promise<Post>
      },
    })),
    postComments: cacheService.createQuerySet((postId: number) => ({
      keys: ['comments', 'post', postId],
      execute: async () => {
        const response = await fetch(`${BASE_URL}/posts/${postId}/comments`)
        if (!response.ok) throw new Error('Failed to fetch comments')
        return response.json() as Promise<Comment[]>
      },
    })),
    userTodos: cacheService.createQuerySet((userId: number) => ({
      keys: ['todos', 'user', userId],
      execute: async () => {
        const response = await fetch(`${BASE_URL}/users/${userId}/todos`)
        if (!response.ok) throw new Error('Failed to fetch todos')
        return response.json() as Promise<Todo[]>
      },
    })),
    userPosts: cacheService.createQuerySet((userId: number) => ({
      keys: ['posts', 'user', userId],
      execute: async () => {
        const response = await fetch(`${BASE_URL}/users/${userId}/posts`)
        if (!response.ok) throw new Error('Failed to fetch user posts')
        return response.json() as Promise<Post[]>
      },
    })),
  },
  infiniteQueries: {
    posts: cacheService.createInfiniteQuerySet(() => ({
      keys: ['posts', 'infinite'],
      execute: async ({ offset, count }) => {
        const response = await fetch(
          `${BASE_URL}/posts?_start=${offset}&_limit=${count}`,
        )
        if (!response.ok) throw new Error('Failed to fetch posts')
        return response.json() as Promise<Post[]>
      },
    })),
    users: cacheService.createInfiniteQuerySet(() => ({
      keys: ['users', 'infinite'],
      execute: async ({ offset, count }) => {
        const response = await fetch(
          `${BASE_URL}/users?_start=${offset}&_limit=${count}`,
        )
        if (!response.ok) throw new Error('Failed to fetch users')
        return response.json() as Promise<User[]>
      },
    })),
  },
}

class QueryManager {
  public queries: Map<
    string,
    {
      name: string
      params: any
      query: any
      lastUpdate: Date | null
    }
  > = new Map()

  constructor() {
    makeAutoObservable(this)
  }

  public registerQuery(id: string, name: string, params: any, query: any) {
    this.queries.set(id, {
      name,
      params,
      query,
      lastUpdate: null,
    })
  }

  public updateLastUpdate(id: string) {
    const queryInfo = this.queries.get(id)
    if (queryInfo) {
      queryInfo.lastUpdate = new Date()
    }
  }

  public getQueries() {
    return Array.from(this.queries.entries()).map(([id, info]) => ({
      id,
      name: info.name,
      params: info.params,
      execute: () => {
        info.query.sync({
          onSuccess: () => this.updateLastUpdate(id),
          onError: () => this.updateLastUpdate(id),
        })
      },
      invalidate: () => {
        info.query.invalidate()
      },
      getStatus: () => ({
        isLoading: info.query.isLoading,
        isSuccess: info.query.isSuccess,
        isError: info.query.isError,
        isIdle: info.query.isIdle,
        data: info.query.data,
        error: info.query.error,
        updatedAt: info.lastUpdate,
      }),
    }))
  }
}

type ManagedQuery = ReturnType<QueryManager['getQueries']>[number]

const renderValue = (value: unknown) => {
  if (value === undefined) return 'undefined'
  if (value === null) return 'null'
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

const getStatusLabel = (query: ManagedQuery) => {
  const status = query.getStatus()
  if (status.isLoading) return 'loading'
  if (status.isError) return 'error'
  if (status.isSuccess) return 'success'
  return 'idle'
}

function BasicQueryDebugger(props: { manager: QueryManager }) {
  const [tick, setTick] = createSignal(0)

  createEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 500)
    onCleanup(() => clearInterval(id))
  })

  const queries = () => props.manager.getQueries()

  return (
    <div style={{ padding: '12px', border: '1px solid #ddd', marginTop: '16px' }}>
      <div style={{ marginBottom: '8px', 'font-weight': 600 }}>Быстрый просмотр состояний (обновление каждые 500ms)</div>
      <For each={queries()}>
        {(query) => {
          const status = query.getStatus()
          return (
            <div style={{ padding: '8px 0', 'border-bottom': '1px solid #eee' }}>
              <div style={{ 'font-weight': 600 }}>{query.name}</div>
              <div>Статус: {getStatusLabel(query)}</div>
              <div>Loading: {String(status.isLoading)}</div>
              <div>Error: {status.isError ? renderValue(status.error) : '-'}</div>
              <div>Data: {renderValue(status.data)}</div>
              <div>Updated: {status.updatedAt ? status.updatedAt.toLocaleTimeString() : '-'}</div>
              <div style={{ marginTop: '4px' }}>
                <button onClick={() => query.execute()} disabled={status.isLoading}>fetch</button>{' '}
                <button onClick={() => query.invalidate()}>invalidate</button>
              </div>
            </div>
          )
        }}
      </For>
      <Show when={queries().length === 0}>
        <div>Нет зарегистрированных запросов</div>
      </Show>
    </div>
  )
}

function bootstrapDemo() {
  const queryManager = new QueryManager()

  const user1 = api.queries.user.create(1)
  queryManager.registerQuery('user-1', 'User #1', { userId: 1 }, user1)

  const user2 = api.queries.user.create(2)
  queryManager.registerQuery('user-2', 'User #2', { userId: 2 }, user2)

  const user3 = api.queries.user.create(3)
  queryManager.registerQuery('user-3', 'User #3', { userId: 3 }, user3)

  const post1 = api.queries.post.create(1)
  queryManager.registerQuery('post-1', 'Post #1', { postId: 1 }, post1)

  const post5 = api.queries.post.create(5)
  queryManager.registerQuery('post-5', 'Post #5', { postId: 5 }, post5)

  const comments1 = api.queries.postComments.create(1)
  queryManager.registerQuery('comments-1', 'Post #1 Comments', { postId: 1 }, comments1)

  const userTodos1 = api.queries.userTodos.create(1)
  queryManager.registerQuery('todos-1', 'User #1 Todos', { userId: 1 }, userTodos1)

  const userPosts1 = api.queries.userPosts.create(1)
  queryManager.registerQuery('user-posts-1', 'User #1 Posts', { userId: 1 }, userPosts1)

  const infinitePosts = api.infiniteQueries.posts.create()
  queryManager.registerQuery('infinite-posts', 'Infinite Posts', {}, infinitePosts)

  const infiniteUsers = api.infiniteQueries.users.create()
  queryManager.registerQuery('infinite-users', 'Infinite Users', {}, infiniteUsers)

  if (import.meta.env.DEV) {
    mountMobxQueryDevtools(cacheService)
  }

  const root = document.getElementById('app') as HTMLElement
  render(
    () => (
      <>
        <App queryManager={queryManager} />
        <BasicQueryDebugger manager={queryManager} />
      </>
    ),
    root,
  )
}

bootstrapDemo()

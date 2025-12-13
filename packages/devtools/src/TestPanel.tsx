import { For, Show, createMemo, createSignal } from 'solid-js'
import type { Accessor } from 'solid-js'

interface QueryInfo {
  id: string
  name: string
  params: unknown
  execute: () => void
  invalidate: () => void
  getStatus: () => {
    isLoading: boolean
    isSuccess: boolean
    isError: boolean
    isIdle: boolean
    data?: unknown
    error?: unknown
    updatedAt?: Date | null
  }
}

interface Props {
  queries: Accessor<QueryInfo[]>
}

export default function TestPanel(props: Props) {
  const [selectedQueryId, setSelectedQueryId] = createSignal<string | null>(null)

  const selectedQuery = createMemo(() => {
    const id = selectedQueryId()
    if (!id) return null
    return props.queries().find((q) => q.id === id) ?? null
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'loading':
        return '#3b82f6'
      case 'success':
        return '#10b981'
      case 'error':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  const getQueryStatus = (query: QueryInfo) => {
    const status = query.getStatus()
    if (status.isLoading) return 'loading'
    if (status.isError) return 'error'
    if (status.isSuccess) return 'success'
    return 'idle'
  }

  const formatDate = (date?: Date | null) => {
    if (!date) return '-'
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date)
  }

  const formatData = (data: unknown) => {
    if (!data) return 'null'
    try {
      return JSON.stringify(data, null, 2)
    } catch {
      return String(data)
    }
  }

  return (
    <div class="test-panel">
      <div class="test-panel-header">
        <h2>Query Test Panel</h2>
        <p class="test-panel-description">Управление и мониторинг запросов</p>
      </div>

      <div class="test-panel-content">
        <div class="queries-list">
          <div class="queries-list-header">
            <h3>Запросы ({props.queries().length})</h3>
          </div>

          <div class="queries-items">
            <For each={props.queries()}>
              {(query) => (
                <div
                  class={`query-item ${selectedQueryId() === query.id ? 'active' : ''}`}
                  onClick={() => setSelectedQueryId(query.id)}
                >
                  <div class="query-item-header">
                    <div class="query-item-name">{query.name}</div>
                    <div
                      class="query-item-status-dot"
                      style={{ 'background-color': getStatusColor(getQueryStatus(query)) }}
                    />
                  </div>

                  <div class="query-item-info">
                    <span class="query-item-status-text">{getQueryStatus(query)}</span>
                    <span class="query-item-time">{formatDate(query.getStatus().updatedAt)}</span>
                  </div>

                  <div class="query-item-actions">
                    <button
                      class="query-action-btn query-action-btn-primary"
                      onClick={(event) => {
                        event.stopPropagation()
                        query.execute()
                      }}
                      disabled={query.getStatus().isLoading}
                    >
                      {query.getStatus().isLoading ? 'Loading...' : 'Fetch'}
                    </button>
                    <button
                      class="query-action-btn query-action-btn-secondary"
                      onClick={(event) => {
                        event.stopPropagation()
                        query.invalidate()
                      }}
                    >
                      Invalidate
                    </button>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>

        <div class="query-details">
          <Show fallback={<div class="query-details-empty"><p>Выберите запрос для просмотра деталей</p></div>} when={selectedQuery()}>
            <div class="query-details-content">
              <div class="query-details-header">
                <h3>{selectedQuery()?.name}</h3>
                <div
                  class="query-details-status"
                  style={{ color: getStatusColor(selectedQuery() ? getQueryStatus(selectedQuery()!) : 'idle') }}
                >
                  {selectedQuery() ? getQueryStatus(selectedQuery()!) : 'idle'}
                </div>
              </div>

              <div class="query-details-section">
                <h4>Параметры</h4>
                <div class="query-details-code">
                  <pre>{formatData(selectedQuery()?.params)}</pre>
                </div>
              </div>

              <div class="query-details-section">
                <h4>Данные</h4>
                <div
                  class={`query-details-code ${selectedQuery()?.getStatus().isError ? 'query-details-code-error' : ''}`}
                >
                  <pre>
                    {selectedQuery()?.getStatus().isError
                      ? formatData(selectedQuery()?.getStatus().error)
                      : formatData(selectedQuery()?.getStatus().data)}
                  </pre>
                </div>
              </div>

              <div class="query-details-section">
                <h4>Метаданные</h4>
                <div class="query-metadata">
                  <div class="query-metadata-item">
                    <span class="query-metadata-label">Последнее обновление:</span>
                    <span class="query-metadata-value">{formatDate(selectedQuery()?.getStatus().updatedAt)}</span>
                  </div>
                  <div class="query-metadata-item">
                    <span class="query-metadata-label">Состояние:</span>
                    <span class="query-metadata-value">
                      {selectedQuery() ? getQueryStatus(selectedQuery()!) : 'idle'}
                    </span>
                  </div>
                </div>
              </div>

              <div class="query-details-actions">
                <button
                  class="query-details-btn query-details-btn-primary"
                  onClick={() => selectedQuery()?.execute()}
                  disabled={selectedQuery()?.getStatus().isLoading}
                >
                  {selectedQuery()?.getStatus().isLoading ? 'Loading...' : 'Выполнить запрос'}
                </button>
                <button
                  class="query-details-btn query-details-btn-secondary"
                  onClick={() => selectedQuery()?.invalidate()}
                >
                  Инвалидировать
                </button>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </div>
  )
}

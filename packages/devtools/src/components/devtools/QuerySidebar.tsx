import { For, createMemo } from 'solid-js'

import type { DevToolsStore } from '../../core/store'
import Input from '../ui/Input'
import Select from '../ui/Select'
import StatusDot from '../ui/StatusDot'
import Badge from '../ui/Badge'
import QueryStatusCounter from './QueryStatusCounter'

interface Props {
  store: DevToolsStore
}

const sortOptions = [
  { value: 'status', label: 'Sort by Status' },
  { value: 'queryKey', label: 'Sort by Query Key' },
  { value: 'lastUpdated', label: 'Sort by Last Updated' },
]

export default function QuerySidebar(props: Props) {
  const getStatusColor = (model: {
    isLoading: boolean
    isError: boolean
    isSuccess: boolean
  }) => {
    if (model.isLoading) return 'fetching'
    if (model.isError) return 'error'
    if (model.isSuccess) return 'success'
    return 'idle'
  }

  const queries = createMemo(() => props.store.filteredQueries)

  return (
    <div class="mq-sidebar">
      <div class="mq-sidebar-header">
        <div class="mq-header-top">
          <h3>Queries</h3>
          <QueryStatusCounter store={props.store} />
        </div>
        <Input
          value={props.store.searchTerm}
          onInput={(value) => props.store.setSearch(value)}
          placeholder="Filter queries..."
        />
        <div class="mq-sort-controls">
          <Select
            value={props.store.sortBy}
            options={sortOptions}
            onChange={(value) => props.store.setSortBy(value as never)}
          />
          <button
            class="mq-sort-order-btn"
            onClick={props.store.toggleSortOrder}
            title={`Sort ${props.store.sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
          >
            {props.store.sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      <div class="mq-query-list mq-scroll-y">
        <For each={queries()}>
          {(query) => (
            <div
              class={`mq-query-item ${props.store.selectedQueryHash === query.hash ? 'active' : ''}`}
              onClick={() => props.store.selectQuery(query.hash)}
            >
              <StatusDot status={getStatusColor(query)} />
              <Badge>{query.type}</Badge>
              <span class="mq-query-key">{JSON.stringify(query.key)}</span>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}

import { For, Show, createEffect, createMemo, createSignal } from 'solid-js'

import type { DevToolsStore } from '../../core/store'
import Button from '../ui/Button'
import Checkbox from '../ui/Checkbox'
import CodeBox from '../ui/CodeBox'
import JsonEditor from '../ui/JsonEditor'
import Explorer from './Explorer'

interface Props {
  store: DevToolsStore
}

type ViewMode = 'explorer' | 'json'

export default function QueryInspector(props: Props) {
  const [viewMode, setViewMode] = createSignal<ViewMode>('explorer')

  const activeQuery = createMemo(() => props.store.activeQuery)

  createEffect(() => {
    // Reset view when selection changes
    const _hash = props.store.selectedQueryHash
    setViewMode('explorer')
  })

  const toggleLoading = (checked: boolean) => props.store.activeQuery?.setIsLoading(checked)
  const toggleSuccess = (checked: boolean) => props.store.activeQuery?.setIsSuccess(checked)
  const toggleError = (checked: boolean) => props.store.activeQuery?.setIsError(checked)
  const handleDataUpdate = (newData: string | object | null) => props.store.activeQuery?.setData(newData)

  return (
    <Show when={activeQuery()} fallback={<div class="mq-empty">Select a query to view details</div>}>
      <div class="mq-inspector mq-scroll-y">
        <div class="mq-toolbar">
          <h2 class="mq-title">Query Details</h2>
          <div class="mq-actions">
            <Button variant="primary" onClick={activeQuery()?.refetch}>Refetch</Button>
            <Button onClick={activeQuery()?.fetchMore} disabled={activeQuery()?.type !== 'infinite'}>
              Fetch more
            </Button>
            <Button variant="danger" onClick={activeQuery()?.invalidate}>Invalidate</Button>
          </div>
        </div>

        <div class="mq-content">
          <div class="mq-section">
            <label>Query Key</label>
            <CodeBox code={JSON.stringify(activeQuery()?.key)} />
          </div>

          <div class="mq-section">
            <label>State</label>
            <div class="mq-control-grid">
              <Checkbox checked={!!activeQuery()?.isLoading} onChange={toggleLoading}>
                <span class={`mq-status-text ${activeQuery()?.isLoading ? 'active' : ''}`}>isLoading</span>
              </Checkbox>
              <Checkbox checked={!!activeQuery()?.isSuccess} onChange={toggleSuccess}>
                <span class="mq-status-text success">isSuccess</span>
              </Checkbox>
              <Checkbox checked={!!activeQuery()?.isError} onChange={toggleError}>
                <span class="mq-status-text error">isError</span>
              </Checkbox>
              <Show when={activeQuery()?.type === 'infinite'}>
                <Checkbox checked={!!activeQuery()?.isEndReached} disabled>
                  <span class="mq-status-text">isEndReached</span>
                </Checkbox>
              </Show>
            </div>
          </div>

          <div class="mq-section">
            <div class="mq-label-row">
              <label>Data</label>
              <div class="mq-view-toggle">
                <button
                  class={`mq-toggle-btn ${viewMode() === 'explorer' ? 'active' : ''}`}
                  onClick={() => setViewMode('explorer')}
                >
                  Explorer
                </button>
                <button
                  class={`mq-toggle-btn ${viewMode() === 'json' ? 'active' : ''}`}
                  onClick={() => setViewMode('json')}
                >
                  JSON
                </button>
              </div>
            </div>

            <Show
              when={viewMode() === 'explorer'}
              fallback={<JsonEditor value={activeQuery()?.data ?? null} onChange={handleDataUpdate} />}
            >
              <div class="mq-explorer-container">
                <Explorer label="data" value={activeQuery()?.data} expanded />
              </div>
            </Show>
          </div>

          <Show when={activeQuery()?.error}>
            <div class="mq-section">
              <label>Error</label>
              <CodeBox code={JSON.stringify(activeQuery()?.error, null, 2)} variant="error" />
            </div>
          </Show>
        </div>
      </div>
    </Show>
  )
}

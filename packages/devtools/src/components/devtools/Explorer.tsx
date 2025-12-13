import { For, Show, createMemo, createSignal } from 'solid-js'
import clsx from 'clsx'

interface ExplorerProps {
  label?: string
  value: unknown
  expanded?: boolean
}

function getType(value: unknown) {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value
}

function displayValue(value: unknown): string {
  const type = getType(value)
  if (type === 'string') return `"${value as string}"`
  if (type === 'object') return '{...}'
  if (type === 'array') return '[...]'
  return String(value)
}

export default function Explorer(props: ExplorerProps) {
  const [isOpen, setIsOpen] = createSignal<boolean>(props.expanded ?? false)

  const isExpandable = createMemo(() => {
    const type = getType(props.value)
    return (type === 'object' || type === 'array') && props.value !== null
  })

  const entries = createMemo(() => {
    if (!isExpandable()) return []
    if (Array.isArray(props.value)) {
      return props.value.map((value, index) => [index, value])
    }
    return Object.entries(props.value as Record<string, unknown>)
  })

  return (
    <div class="mq-explorer">
      <div
        class={clsx('mq-explorer-row', isExpandable() && 'expandable')}
        onClick={() => (isExpandable() ? setIsOpen((prev) => !prev) : undefined)}
      >
        <Show when={props.label}>
          <span class="mq-explorer-label">{props.label}</span>
        </Show>
        <span class="mq-explorer-value">{displayValue(props.value)}</span>
        <Show when={isExpandable()}>
          <span class="mq-expander">{isOpen() ? '−' : '+'}</span>
        </Show>
      </div>
      <Show when={isOpen()}>
        <div class="mq-explorer-children">
          <For each={entries()}>
            {([key, value]) => (
              <Explorer label={String(key)} value={value} />
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}

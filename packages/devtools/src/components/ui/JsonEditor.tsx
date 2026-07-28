import { createEffect, createMemo, createSignal } from 'solid-js'

interface JsonEditorProps {
  value: string | object | null
  indent?: number
  withoutEdit?: boolean
  withoutError?: boolean
  debounce?: number
  onChange?: (value: string | object | null) => void
}

const DEFAULT_INDENT = 2

function formatValue(value: JsonEditorProps['value'], indent: number) {
  if (value === null || typeof value === 'undefined') return ''
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value, null, indent)
  } catch {
    return String(value)
  }
}

export default function JsonEditor(props: JsonEditorProps) {
  const indent = props.indent ?? DEFAULT_INDENT
  const [text, setText] = createSignal(formatValue(props.value, indent))
  const [error, setError] = createSignal<string | null>(null)

  createEffect(() => {
    setText(formatValue(props.value, indent))
  })

  const onInput = (next: string) => {
    setText(next)
    if (props.withoutEdit) return

    try {
      const parsed = next ? JSON.parse(next) : null
      props.onChange?.(parsed)
      setError(null)
    } catch (err) {
      if (!props.withoutError) {
        setError((err as Error).message)
      }
    }
  }

  const rows = createMemo(() => Math.max(8, Math.min(20, text().split('\n').length + 2)))

  return (
    <div class="mq-json-editor">
      <textarea
        class="mq-json-textarea"
        value={text()}
        rows={rows()}
        onInput={(event) => onInput(event.currentTarget.value)}
        spellcheck={false}
        disabled={props.withoutEdit}
      />
      <div class="mq-json-preview" innerHTML={highlight(text())} />
      {error() && <div class="mq-json-error">{error()}</div>}
    </div>
  )
}

const COLORS = {
  number: '#a9dc76',
  braces: '#84aecc',
  brackets: '#d26a6a',
  colon: '#8b949e',
  comma: '#ffa657',
  string: '#78dce8',
  stringQuotes: '#e393ff',
  key: '#ff6188',
  keyQuotes: '#fc9867',
  null: '#cccccc',
  true: '#a5d6ff',
  false: '#f85149',
}

function highlight(source: string) {
  try {
    const parsed = JSON.parse(source || 'null')
    const html = formatNode(parsed)
    return html
  } catch {
    return escapeHtml(source)
  }
}

function escapeHtml(text: string) {
  const div = document.createElement('div')
  div.innerText = text
  return div.innerHTML
}

function formatNode(node: unknown, offset = 0): string {
  const pad = (spaces: number) => '&nbsp;'.repeat(spaces)

  if (node === null) {
    return `<span style="color:${COLORS.null}">null</span>`
  }

  if (Array.isArray(node)) {
    const items = node
      .map((value) => `${pad(offset + DEFAULT_INDENT)}${formatNode(value, offset + DEFAULT_INDENT)}`)
      .join(`<span style="color:${COLORS.comma}">,</span>\n`)

    return `${wrap('[', COLORS.brackets)}${items ? '\n' + items + '\n' + pad(offset) : ''}${wrap(']', COLORS.brackets)}`
  }

  if (typeof node === 'object') {
    const entries = Object.entries(node as Record<string, unknown>)
    const body = entries
      .map(
        ([key, value]) =>
          `${pad(offset + DEFAULT_INDENT)}${wrap(`"${key}"`, COLORS.key, COLORS.keyQuotes)}${wrap(':', COLORS.colon)} ${formatNode(value, offset + DEFAULT_INDENT)}`,
      )
      .join(`<span style="color:${COLORS.comma}">,</span>\n`)

    return `${wrap('{', COLORS.braces)}${body ? '\n' + body + '\n' + pad(offset) : ''}${wrap('}', COLORS.braces)}`
  }

  if (typeof node === 'string') {
    return wrap(`"${node}"`, COLORS.string, COLORS.stringQuotes)
  }

  if (typeof node === 'number') {
    return wrap(String(node), COLORS.number)
  }

  if (typeof node === 'boolean') {
    return wrap(String(node), COLORS[node ? 'true' : 'false'])
  }

  return wrap(String(node), COLORS.null)
}

function wrap(text: string, color: string, quoteColor?: string) {
  if (quoteColor) {
    return `<span style="color:${color}"><span style="color:${quoteColor}">"</span>${escapeHtml(text.replace(/\"/g, '"'))}<span style="color:${quoteColor}">"</span></span>`
  }
  return `<span style="color:${color}">${escapeHtml(text)}</span>`
}

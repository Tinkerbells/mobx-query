import { createMemo } from 'solid-js'

import type { DevToolsStore } from '../../core/store'

interface Props {
  store: DevToolsStore
}

export default function QueryStatusCounter(props: Props) {
  const counts = createMemo(() => {
    const all = props.store.queries
    return {
      total: all.length,
      loading: all.filter((q) => q.isLoading).length,
      success: all.filter((q) => q.isSuccess).length,
      error: all.filter((q) => q.isError).length,
    }
  })

  return (
    <div class="mq-status-counter">
      <span class="mq-dot loading" /> {counts().loading}
      <span class="mq-dot success" /> {counts().success}
      <span class="mq-dot error" /> {counts().error}
      <span class="mq-dot idle" /> {counts().total - counts().loading - counts().success - counts().error}
    </div>
  )
}

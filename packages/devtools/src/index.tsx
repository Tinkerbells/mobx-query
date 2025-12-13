import { render } from 'solid-js/web'
import type { MobxQuery } from '@tinkerbells/mobx-query'

import { DevToolsAdapter } from './core/adapter'
import { DevToolsStore } from './core/store'
import { cssStyles } from './styles'
import { setupMobxSolid } from './mobxSolid'
import MobxQueryDevTools from './components/devtools/MobxQueryDevTools'

export type { DevToolsStore } from './core/store'

export function mountMobxQueryDevtools(
  client: MobxQuery,
  target: HTMLElement = document.body,
) {
  setupMobxSolid()
  const adapter = new DevToolsAdapter(client)
  const store = new DevToolsStore(adapter)

  const host = document.createElement('div')
  target.appendChild(host)
  const shadow = host.attachShadow({ mode: 'open' })

  const style = document.createElement('style')
  style.textContent = cssStyles
  shadow.appendChild(style)

  const mountPoint = document.createElement('div')
  shadow.appendChild(mountPoint)

  const dispose = render(
    () => <MobxQueryDevTools store={store} shadowRoot={shadow} />,
    mountPoint,
  )

  return () => {
    store.destroy()
    dispose()
    host.remove()
  }
}

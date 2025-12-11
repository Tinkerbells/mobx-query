import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { mountMobxQueryDevtools } from '@tinkerbells/mobx-query-devtools'
import { cacheService } from './stores/cache'

const app = createApp(App)

// Монтируем DevTools только в dev режиме
if (import.meta.env.DEV) {
  mountMobxQueryDevtools(cacheService)
}

app.mount('#app')

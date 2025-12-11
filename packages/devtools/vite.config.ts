import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MobxQueryDevtools',
      fileName: (format) => `mobx-query-devtools.${format}.js`,
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['vue', 'mobx', 'mobx-vue-lite', '@tinkerbells/mobx-query'],
      output: {
        globals: {
          vue: 'Vue',
          mobx: 'mobx',
          'mobx-vue-lite': 'mobxVueLite',
          '@tinkerbells/mobx-query': 'MobxQuery'
        }
      }
    }
  }
})

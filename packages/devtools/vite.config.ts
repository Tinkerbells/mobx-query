import { resolve } from 'path'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    solid(),
    dts({
      insertTypesEntry: true,
      include: ['src/**/*.ts', 'src/**/*.tsx']
    })
  ],
  resolve: {
    alias: {
      '@tanstack/query-core': resolve(__dirname, 'src/tanstack/types.ts')
    }
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'MobxQueryDevtools',
      fileName: (format) => `mobx-query-devtools.${format}.js`,
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: [
        'mobx',
        'solid-js',
        'solid-js/web',
        '@tinkerbells/mobx-query',
        '@kobalte/core',
        '@solid-primitives/keyed',
        '@solid-primitives/resize-observer',
        '@solid-primitives/storage',
        '@tanstack/match-sorter-utils',
        'clsx',
        'goober',
        'solid-transition-group',
        'superjson'
      ],
      output: {
        globals: {
          mobx: 'mobx',
          'solid-js': 'solidJs',
          'solid-js/web': 'solidJsWeb',
          '@tinkerbells/mobx-query': 'MobxQuery',
          '@kobalte/core': 'Kobalte',
          '@solid-primitives/keyed': 'SolidPrimitivesKeyed',
          '@solid-primitives/resize-observer': 'SolidPrimitivesResizeObserver',
          '@solid-primitives/storage': 'SolidPrimitivesStorage',
          '@tanstack/match-sorter-utils': 'TanstackMatchSorterUtils',
          clsx: 'clsx',
          goober: 'goober',
          'solid-transition-group': 'solidTransitionGroup',
          superjson: 'superjson'
        }
      }
    }
  }
})

import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm'],
  dts: true,
  outDir: 'lib',
  tsconfig: './tsconfig.build.json',
  platform: 'neutral',
  target: 'es2018',
  external: ['mobx'],
  outExtensions: () => ({
    js: '.js',
  }),
});

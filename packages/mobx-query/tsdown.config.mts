import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm'],
  dts: true,
  outDir: 'lib',
  tsconfig: './tsconfig.build.json',
  platform: 'neutral',
  target: 'es2018',
  external: [
    'mobx',
    '@astral/utils',
    '@emotion/hash',
    'fast-json-stable-stringify',
    'utility-types',
  ],
  outExtensions: () => ({
    js: '.js',
  }),
});

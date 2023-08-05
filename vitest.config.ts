import { defineConfig } from 'vitest/config'

import { resolve } from 'node:path'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  base: '/',
  resolve: {
    alias: [{ find: '@', replacement: resolve(__dirname, './src') }],
  },
})
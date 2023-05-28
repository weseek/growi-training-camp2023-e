import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
  ],
  test: {
    environment: 'node',
    exclude: [
      '**/test/**',
    ],
    clearMocks: true,
    globals: true,
  },
});

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['backend/services/**/*.test.js', 'src/utils/**/*.test.js'],
  },
});
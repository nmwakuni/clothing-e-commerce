import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts', '**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        'build/',
        '.next/',
        '**/*.config.ts',
        '**/*.config.js',
        '**/types.ts',
      ],
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70,
    },
  },
});

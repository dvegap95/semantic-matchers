import {defineConfig} from 'vitest/config';

/**
 * Root Vitest config for the monorepo.
 * Powers `yarn test:watch` from the repo root and the Vitest editor extension.
 */
export default defineConfig({
  test: {
    projects: [
      'packages/core/vitest.config.ts',
      'packages/jest/vitest.config.ts',
      'packages/vitest/vitest.config.ts',
    ],
  },
});

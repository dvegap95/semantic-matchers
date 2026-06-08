import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vitest/config';

const packageDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: packageDir,
  test: {
    name: '@semantic-matchers/core',
    include: ['src/**/*.test.ts'],
    typecheck: {
      tsconfig: './tsconfig.spec.json',
    },
  },
});

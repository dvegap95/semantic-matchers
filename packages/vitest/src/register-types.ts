/**
 * Side-effect import: merges SemanticClassMatchers into Vitest's Assertion.
 *
 * Usage in tsconfig or setup file:
 *   import '@semantic-matchers/vitest/register-types';
 */
import '@semantic-matchers/core';
import type {SemanticClassMatchers} from '@semantic-matchers/core';
import type {} from 'vitest';

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Assertion<T = any>
    extends SemanticClassMatchers<Promise<void>, T> {}
}

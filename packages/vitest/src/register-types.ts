/**
 * Side-effect import: merges SemanticClassMatchers into Vitest's Assertion.
 *
 * Usage in tsconfig or setup file:
 *   import '@semantic-matchers/vitest/register-types';
 */
import '@semantic-matchers/core';
import type {
  MatchersForInstance,
  SemanticClassMatchers,
  SemanticMatchers,
} from '@semantic-matchers/core';
import type {} from 'vitest';

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Assertion<T = any>
    extends SemanticMatchers<Promise<void>>,
      MatchersForInstance<T, Promise<void>>,
      SemanticClassMatchers<Promise<void>, T> {}
}

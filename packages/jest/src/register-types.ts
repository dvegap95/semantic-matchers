/**
 * Side-effect import: merges SemanticClassMatchers into Jest's ClassMatchers.
 *
 * Usage in tsconfig or setup file:
 *   import '@semantic-matchers/jest/register-types';
 */
import '@semantic-matchers/core';
import type {
  MatchersForInstance,
  SemanticClassMatchers,
  SemanticMatchers,
} from '@semantic-matchers/core';
import type {} from 'expect';

declare module 'expect' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ClassMatchers<R, T>
    extends SemanticMatchers<R>,
      MatchersForInstance<T, R>,
      SemanticClassMatchers<R, T> {}
}

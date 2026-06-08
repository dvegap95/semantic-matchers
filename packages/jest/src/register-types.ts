/**
 * Side-effect import: merges SemanticClassMatchers into Jest's ClassMatchers.
 *
 * Usage in tsconfig or setup file:
 *   import '@semantic-matchers/jest/register-types';
 */
import '@semantic-matchers/core';

declare module 'expect' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ClassMatchers<R, T> extends import('@semantic-matchers/core').SemanticClassMatchers<R, T> {}
}

/**
 * Side-effect import: merges SemanticClassMatchers into Jest's ClassMatchers.
 *
 * Usage in tsconfig or setup file:
 *   import '@semantic-matchers/jest/register-types';
 */
import '@semantic-matchers/core';
import type {SemanticClassMatchers} from '@semantic-matchers/core';
import type {} from 'expect';

declare module 'expect' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ClassMatchers<R, T> extends SemanticClassMatchers<R, T> {}
}

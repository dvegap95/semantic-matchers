import '@semantic-matchers/core';

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Assertion<T = any>
    extends import('@semantic-matchers/core').SemanticClassMatchers<
      Promise<void>,
      T
    > {}
}

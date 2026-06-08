/** Test-only matcher augmentations (same pattern as consumer apps). */
declare module '@semantic-matchers/core' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface SemanticClassMatchers<R, T> {
    toHaveEmail(expected: string): R;
    toHaveCode(expected: string): R;
    toMatchEntity(): R;
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface SemanticGlobalMatchers<R, T> {
    toEqual(expected: unknown): R;
    toMatch(expected: unknown): R;
    toBeTruthy(): R;
  }
}

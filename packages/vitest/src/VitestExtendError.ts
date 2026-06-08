/**
 * Mirrors Vitest's internal JestExtendError — carries actual/expected for diffs.
 * @see https://github.com/vitest-dev/vitest/blob/v3.2.6/packages/expect/src/jest-extend.ts
 */
export class VitestExtendError extends Error {
  constructor(
    message: string,
    public actual?: unknown,
    public expected?: unknown,
  ) {
    super(message);
  }
}

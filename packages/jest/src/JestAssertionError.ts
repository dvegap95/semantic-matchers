export class JestAssertionError extends Error {
  matcherResult?: {
    pass: boolean;
    message: string;
    actual?: unknown;
    expected?: unknown;
  };
  actual?: unknown;
  expected?: unknown;
}

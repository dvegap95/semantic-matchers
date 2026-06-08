import type {SemanticMatcherContext, SemanticMatcherFn} from '@semantic-matchers/core';

/** Jest MatcherContext shape — kept structural to avoid tight coupling. */
export type JestMatcherContext = SemanticMatcherContext & {
  equals?: (a: unknown, b: unknown) => boolean;
  utils?: Record<string, unknown>;
  customTesters?: Array<unknown>;
  dontThrow?: () => void;
  promise?: string;
  error?: Error;
};

export type JestRawMatcherFn = (
  this: JestMatcherContext,
  received: unknown,
  ...expected: Array<unknown>
) => {pass: boolean; message?: string | (() => string)} | Promise<{
  pass: boolean;
  message?: string | (() => string);
}>;

/**
 * Adapts a canonical semantic matcher to Jest's `expect.extend` calling convention.
 */
export function adaptMatcher(semanticMatcher: SemanticMatcherFn): JestRawMatcherFn {
  return function adaptedMatcher(this: JestMatcherContext, received, ...expected) {
    return (
      semanticMatcher as (
        ...fnArgs: Array<unknown>
      ) => ReturnType<typeof semanticMatcher>
    ).call(this, received, ...expected);
  };
}

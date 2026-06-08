/**
 * Owned type contracts for semantic-matchers.
 *
 * Framework adapters map their host context onto SemanticMatcherContext.
 * Matcher libraries (e.g. MUI page objects) augment SemanticClassMatchers only.
 */

export type MatcherResult = {
  pass: boolean;
  message: () => string;
};

export type AsyncMatcherResult = Promise<MatcherResult>;

export type ClassConstructor<T = unknown> = new (...args: Array<unknown>) => T;

/**
 * Empty interface — users and libraries augment via declaration merging.
 *
 * @example
 * declare module '@semantic-matchers/core' {
 *   interface SemanticClassMatchers<R, T> {
 *     toMatchEntityIdentity(expected: Entity): R;
 *   }
 * }
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SemanticClassMatchers<_R, T> {
  /** @internal Anchor for instance type inference in augmentations. */
  readonly _semanticInstance?: T;
}

/** Global matchers slot — adapters may merge host builtins here for typing only. */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SemanticGlobalMatchers<_R, _T> {}

export type SemanticMatcherName = string;

/**
 * Canonical matcher function shape — define matchers once against this.
 * Adapters translate `this` / context when wiring to Jest or Vitest.
 */
export type SemanticMatcherFn<
  TActual = unknown,
  TExpected extends Array<unknown> = [],
> = (
  this: SemanticMatcherContext<TActual>,
  actual: TActual,
  ...expected: TExpected
) => MatcherResult | AsyncMatcherResult;

export type SemanticMatchersObject<TActual = unknown> = Record<
  SemanticMatcherName,
  SemanticMatcherFn<TActual, any>
>;

/**
 * Context available inside a semantic matcher.
 * Host-specific fields (equals, printReceived, testPath, …) are injected by adapters.
 */
export type SemanticMatcherContext<TActual = unknown> = {
  isNot: boolean;
  promise?: 'resolves' | 'rejects' | null;

  /** Composed implementation from parent class or previous global override. */
  baseMatcher?: (...args: Array<unknown>) => unknown;

  /** Class-scoped + inherited matchers for the current actual type. */
  matchers: SemanticMatchersObject<TActual>;

  /** Global matchers only (no class scope). */
  rawMatchers: SemanticMatchersObject;

  /** Host-injected bag — adapters populate; core does not depend on its shape. */
  host: HostContext;
};

/**
 * Opaque host context. Adapters narrow this when adapting matchers.
 * Keeps @semantic-matchers/core free of jest / vitest imports.
 */
export type HostContext = Record<string, unknown>;

export type ExpectPathSegment = 'not' | 'resolves' | 'rejects';

export type ExpectPath = {
  negated: boolean;
  promise: 'resolves' | 'rejects' | null;
};

export const EMPTY_EXPECT_PATH: ExpectPath = {
  negated: false,
  promise: null,
};

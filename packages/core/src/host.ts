import type {
  ExpectPath,
  MatcherResult,
  SemanticMatcherContext,
  SemanticMatcherFn,
} from './types.js';

/**
 * Contract between @semantic-matchers/core and a test runner (Jest, Vitest, …).
 * See docs/HOST_INTERFACE.md for full specification.
 */
export type ExpectHost = {
  /** Runner's native expect function (used for builtins, asymmetric matchers, spies). */
  readonly nativeExpect: unknown;

  /** Detect promises without core importing runner utilities. */
  isPromise(value: unknown): value is Promise<unknown>;

  /** Invoke a matcher and translate result into runner assertion semantics. */
  runMatcher(options: RunMatcherOptions): unknown;

  /** Register global matchers on the host (optional — adapter may own globals). */
  registerGlobalMatchers?: (
    matchers: Record<string, SemanticMatcherFn>,
    options?: {isInternal?: boolean},
  ) => void;

  /** Build host context bag injected as `ctx.host`. */
  createHostContext(state: HostRunState): HostRunState['hostBag'];
};

export type HostRunState = {
  actual: unknown;
  matcherName: string;
  path: ExpectPath;
  args: Array<unknown>;
  hostBag: Record<string, unknown>;
};

export type RunMatcherOptions = {
  matcher: SemanticMatcherFn;
  context: SemanticMatcherContext;
  actual: unknown;
  args: Array<unknown>;
  path: ExpectPath;
  matcherName: string;
};

export type AdaptedMatcher = (
  actual: unknown,
  ...args: Array<unknown>
) => MatcherResult | Promise<MatcherResult> | void;

/**
 * Adapts a canonical semantic matcher to the host's calling convention.
 * Jest/Vitest adapters implement this once; matcher libraries never touch it.
 */
export type MatcherAdapter = {
  wrapMatcher(
    semanticMatcher: SemanticMatcherFn,
    buildContext: (state: HostRunState) => SemanticMatcherContext,
  ): AdaptedMatcher;
};

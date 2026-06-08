import type {SemanticClassMatchers, SemanticGlobalMatchers} from '../types.js';

/**
 * Matchers available on `expect(actual)` for a given instance type.
 * Libraries augment `SemanticClassMatchers`; adapters merge host builtins via `SemanticGlobalMatchers`.
 */
export type MatcherSurface<R, T> = SemanticClassMatchers<R, T> &
  SemanticGlobalMatchers<R, T> & {
    [matcherName: string]: (...args: Array<unknown>) => R;
  };

export type InverseMatchers<R, T> = {
  not: MatcherSurface<R, T>;
};

export type PromiseMatcherSurface<R, T> = {
  resolves: MatcherSurface<R, T> & InverseMatchers<R, T>;
  rejects: MatcherSurface<R, T> & InverseMatchers<R, T>;
};

/** Typed return of `expect(actual)` — mirrors prototype `ExpectationFor`. */
export type ExpectationFor<T, R = void> = MatcherSurface<R, T> &
  InverseMatchers<R, T> &
  PromiseMatcherSurface<R, T>;

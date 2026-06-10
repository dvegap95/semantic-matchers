import type {
  MatchersForInstance,
  SemanticMatchers,
} from './classMatchers.js';
import type {SemanticClassMatchers, SemanticGlobalMatchers} from '../types.js';

/**
 * Matchers available on `expect(actual)` for a given instance type.
 *
 * Augment:
 * - `SemanticMatchers<R>` — global matchers (`expect.extend(rawMatchers)`)
 * - `SemanticClassMatcherMap<R>` — per-class (`expect.extend(matchers, User)`)
 * - `SemanticClassMatchers<R, T>` — legacy instance augmentation (still supported)
 */
export type MatcherSurface<R, T> = SemanticMatchers<R> &
  MatchersForInstance<T, R> &
  SemanticClassMatchers<R, T> &
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

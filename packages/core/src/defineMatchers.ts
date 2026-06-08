import type {
  ClassConstructor,
  SemanticMatcherFn,
  SemanticMatchersObject,
} from './types.js';

export type ClassMatcherBundle<T extends ClassConstructor> = {
  readonly Class: T;
  readonly matchers: SemanticMatchersObject<InstanceType<T>>;
};

export type MatcherLibrary = ReadonlyArray<ClassMatcherBundle<ClassConstructor>>;

/**
 * Type-preserving helper for libraries (MUI page objects, domain entities, …).
 * No framework import — safe to depend on from shared test utilities.
 */
export function defineClassMatchers<T extends ClassConstructor>(
  Class: T,
  matchers: SemanticMatchersObject<InstanceType<T>>,
): ClassMatcherBundle<T> {
  return {Class, matchers};
}

/**
 * Batch definition for a matcher pack.
 *
 * @example
 * export const muiMatchers = defineMatcherLibrary([
 *   defineClassMatchers(MuiButton, { toHaveAccessibleName(ctx, el, name) { … } }),
 * ]);
 */
export function defineMatcherLibrary(
  bundles: Array<ClassMatcherBundle<ClassConstructor>>,
): MatcherLibrary {
  return bundles;
}

/** Ergonomic single-matcher builder for documentation / tests. */
export function defineMatcher<TActual, TExpected extends Array<unknown>>(
  fn: SemanticMatcherFn<TActual, TExpected>,
): SemanticMatcherFn<TActual, TExpected> {
  return fn;
}

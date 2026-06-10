import type {SemanticMatcherFn} from '../types.js';

/** Jest-style matcher map — use with `expect.extend(matchers, Class?)`. */
export type MatchersObject<TActual = unknown> = Record<
  string,
  SemanticMatcherFn<TActual, any>
>;

/**
 * Matchers declared for one class, merged into `expect(actual)` when `actual` is
 * assignable to `TInstance`.
 *
 * @example
 * declare module '@semantic-matchers/core' {
 *   interface SemanticClassMatcherMap<R> {
 *     User: ExtendedMatchersForClass<User, R, {
 *       toHaveEmail(expected: string): R;
 *     }>;
 *   }
 * }
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SemanticClassMatcherMap<_R> {}

/** Global matchers on every `expect(actual)` — augment like prototype `Matchers<R>`. */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SemanticMatchers<_R> {}

/**
 * Per-class matcher bundle for declaration merging.
 * Keys are instance types (`User`, `A`, `B`, …) — same pattern as prototype `ClassMatchers<R>`.
 */
export type ExtendedMatchersForClass<
  _TInstance,
  R,
  Extended extends Record<string, (...args: Array<unknown>) => unknown>,
> = {
  [K in keyof Extended]: Extended[K] extends (...args: infer P) => unknown
    ? (...args: P) => R
    : never;
};

type UnionToIntersection<U> = (
  U extends unknown ? (value: U) => void : never
) extends (value: infer I) => void
  ? I
  : never;

/** Resolves class-scoped matchers for an instance type (includes inheritance). */
export type MatchersForInstance<T, R> =
  keyof SemanticClassMatcherMap<R> extends never
    ? // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      {}
    : UnionToIntersection<
        {
          [K in keyof SemanticClassMatcherMap<R>]: T extends K
            ? SemanticClassMatcherMap<R>[K]
            : never;
        }[keyof SemanticClassMatcherMap<R>]
      >;

/** Alias for teams migrating from the prototype `ClassMatchers<R> { A: …; B: … }` shape. */
export type ClassMatchers<R> = SemanticClassMatcherMap<R>;

/** Alias for prototype `Matchers<R>`. */
export type Matchers<R> = SemanticMatchers<R>;

/**
 * @semantic-matchers/vitest
 *
 * Reuses the same canonical matcher definitions as Jest.
 * Only host wiring and type augmentation targets differ.
 *
 * @status Stub — implement after @semantic-matchers/jest (shared adaptMatcher util).
 */

export function installVitestSemanticExpect(): never {
  throw new Error(
    '@semantic-matchers/vitest: not implemented yet. Vitest adapter should reuse createJestHost logic with vitest expect. See docs/MATCHER_AUTHORING.md',
  );
}

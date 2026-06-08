import {createSemanticExpect, type MatcherLibrary} from '@semantic-matchers/core';
import {expect as vitestExpect} from 'vitest';
import {createVitestHost} from './createVitestHost.js';

export type InstallVitestSemanticExpectOptions = {
  /** Expose the runner's original expect under this global name. */
  exposeOriginalAs?: 'vitestExpect' | 'originalExpect' | false;
  /** Assign to globalThis.expect */
  global?: boolean;
  /** Pre-register matcher libraries (MUI, domain entities, …). */
  libraries?: MatcherLibrary;
};

export {createVitestHost} from './createVitestHost.js';
export {VitestExtendError} from './VitestExtendError.js';
export {createJestHost, adaptMatcher, JestAssertionError} from '@semantic-matchers/jest';

/**
 * Installs semantic class matchers on top of Vitest's `expect`.
 * Uses a Vitest-specific host so matcher failures include actual/expected for diffs.
 */
export function installVitestSemanticExpect(
  nativeExpect: unknown = vitestExpect,
  options: InstallVitestSemanticExpectOptions = {},
) {
  const host = createVitestHost(nativeExpect);
  const semanticExpect = createSemanticExpect({
    host,
    libraries: options.libraries,
  });

  if (options.global !== false && typeof globalThis !== 'undefined') {
    if (options.exposeOriginalAs) {
      (globalThis as Record<string, unknown>)[options.exposeOriginalAs] =
        nativeExpect;
    }
    (globalThis as Record<string, unknown>).expect = semanticExpect;
  }

  return {expect: semanticExpect, originalExpect: nativeExpect};
}

/**
 * @semantic-matchers/jest
 *
 * @status Stub — implement createJestHost + installSemanticExpect per docs/IMPLEMENTATION_PLAN.md
 */

import {createSemanticExpect} from '@semantic-matchers/core';
import type {MatcherLibrary} from '@semantic-matchers/core';
import type {ExpectHost} from '@semantic-matchers/core';

export type InstallSemanticExpectOptions = {
  /** Expose the runner's original expect under this global name. */
  exposeOriginalAs?: 'jestExpect' | 'originalExpect' | false;
  /** Assign to globalThis.expect */
  global?: boolean;
  /** Pre-register matcher libraries (MUI, domain entities, …). */
  libraries?: MatcherLibrary;
};

/**
 * Placeholder — throws until Jest host adapter is implemented.
 */
export function createJestHost(_nativeExpect: unknown): ExpectHost {
  throw new Error(
    '@semantic-matchers/jest: createJestHost is not implemented yet. See docs/IMPLEMENTATION_PLAN.md',
  );
}

export function installSemanticExpect(
  nativeExpect: unknown,
  options: InstallSemanticExpectOptions = {},
) {
  const host = createJestHost(nativeExpect);
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

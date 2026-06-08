import {createSemanticExpect} from '@semantic-matchers/core';
import type {MatcherLibrary} from '@semantic-matchers/core';
import {createJestHost} from './createJestHost.js';

export type InstallSemanticExpectOptions = {
  /** Expose the runner's original expect under this global name. */
  exposeOriginalAs?: 'jestExpect' | 'originalExpect' | false;
  /** Assign to globalThis.expect */
  global?: boolean;
  /** Pre-register matcher libraries (MUI, domain entities, …). */
  libraries?: MatcherLibrary;
};

export {createJestHost} from './createJestHost.js';
export {adaptMatcher} from './adaptMatcher.js';
export {executeSemanticMatcher} from './executeMatcher.js';
export {JestAssertionError} from './JestAssertionError.js';
export type {JestMatcherContext, JestRawMatcherFn} from './adaptMatcher.js';

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

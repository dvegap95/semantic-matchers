import {
  defineClassMatchers,
  defineMatcherLibrary,
} from '@semantic-matchers/core';
import {User} from './userMatchers.js';

/**
 * Approach B — matcher pack for libraries or bulk install.
 *
 * Register either way:
 *   installSemanticExpect(expect, { libraries: userMatcherPack });
 *   expect.extend(userMatcherBundle.matchers, userMatcherBundle.Class);
 */
export const userMatcherBundle = defineClassMatchers(User, {
  toHaveEmail(actual, expected: string) {
    const pass = actual.email === expected;
    return {
      pass,
      message: () =>
        pass
          ? `expected user not to have email ${expected}`
          : `expected user to have email ${expected}, received ${actual.email}`,
      actual: actual.email,
      expected,
    };
  },
});

export const userMatcherPack = defineMatcherLibrary([userMatcherBundle]);

import type {
  ExtendedMatchersForClass,
  MatchersObject,
} from '@semantic-matchers/core';

export class User {
  email = '';
  constructor(email = '') {
    this.email = email;
  }
}

function toHaveEmailMatcher(actual: User, expected: string) {
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
}

/**
 * Approach A — register in setup with `expect.extend(userMatchers, User)`.
 * Same pattern as the prototype.
 */
export const userMatchers: MatchersObject<User> = {
  toHaveEmail: toHaveEmailMatcher,
};

declare module '@semantic-matchers/core' {
  interface SemanticClassMatcherMap<R> {
    User: ExtendedMatchersForClass<
      User,
      R,
      {
        toHaveEmail(expected: string): R;
      }
    >;
  }
}

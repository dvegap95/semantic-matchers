import {defineClassMatchers} from '@semantic-matchers/core';

export class User {
  email = '';
  constructor(email = '') {
    this.email = email;
  }
}

export const userMatchers = defineClassMatchers(User, {
  toHaveEmail(actual, expected: string) {
    const pass = actual.email === expected;
    return {
      pass,
      message: () =>
        pass
          ? `expected user not to have email ${expected}`
          : `expected user to have email ${expected}`,
      actual: actual.email,
      expected,
    };
  },
});

declare module '@semantic-matchers/core' {
  interface SemanticClassMatchers<R, T> {
    toHaveEmail(expected: string): R;
  }
}

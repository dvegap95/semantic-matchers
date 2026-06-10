import '@semantic-matchers/vitest/register-types';
import {installVitestSemanticExpect, VitestExtendError} from '@semantic-matchers/vitest';
import {User, userMatchers} from '../jest/userMatchers.js';

const {expect} = installVitestSemanticExpect(undefined, {global: false});
expect.extend(userMatchers, User);

const user = new User('alice@example.com');
expect(user).toHaveEmail('alice@example.com');

try {
  expect(new User('wrong@example.com')).toHaveEmail('alice@example.com');
} catch (error) {
  const failure = error as VitestExtendError;
  console.log({message: failure.message, actual: failure.actual, expected: failure.expected});
}

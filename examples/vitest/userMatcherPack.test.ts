import '@semantic-matchers/vitest/register-types';
import {installVitestSemanticExpect, VitestExtendError} from '@semantic-matchers/vitest';
import {User} from '../jest/userMatchers.js';
import {userMatcherPack} from '../jest/userMatcherPack.js';

const {expect} = installVitestSemanticExpect(undefined, {
  global: false,
  libraries: userMatcherPack,
});

const user = new User('alice@example.com');
expect(user).toHaveEmail('alice@example.com');

try {
  expect(new User('wrong@example.com')).toHaveEmail('alice@example.com');
} catch (error) {
  const failure = error as VitestExtendError;
  console.log({message: failure.message, actual: failure.actual, expected: failure.expected});
}

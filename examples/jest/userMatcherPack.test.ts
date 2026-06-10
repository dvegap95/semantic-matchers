/**
 * Approach B — `defineClassMatchers` / `defineMatcherLibrary` (matcher pack).
 */
import '@semantic-matchers/jest/register-types';
import expect from 'expect';
import {installSemanticExpect} from '@semantic-matchers/jest';
import {User} from './userMatchers.js';
import {userMatcherPack} from './userMatcherPack.js';

const {expect: semanticExpect} = installSemanticExpect(expect, {
  global: false,
  libraries: userMatcherPack,
});

const user = new User('alice@example.com');

semanticExpect(user).toHaveEmail('alice@example.com');
await semanticExpect(Promise.resolve(user)).resolves.toHaveEmail(
  'alice@example.com',
);

try {
  semanticExpect(new User('wrong@example.com')).toHaveEmail('alice@example.com');
} catch (error) {
  console.error((error as Error).message);
}

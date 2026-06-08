import '@semantic-matchers/jest/register-types';
import expect from 'expect';
import {installSemanticExpect} from '@semantic-matchers/jest';
import {User, userMatchers} from './userMatchers.js';

const {expect: semanticExpect} = installSemanticExpect(expect, {global: false});
semanticExpect.extend(userMatchers.matchers, userMatchers.Class);

const user = new User('alice@example.com');

semanticExpect(user).toHaveEmail('alice@example.com');
await semanticExpect(Promise.resolve(user)).resolves.toHaveEmail(
  'alice@example.com',
);

// Failure (Jest host): message string only unless you inspect error.actual on JestAssertionError
try {
  semanticExpect(new User('wrong@example.com')).toHaveEmail('alice@example.com');
} catch (error) {
  console.error((error as Error).message);
}

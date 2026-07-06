import {equals, iterableEquality, subsetEquality} from '@jest/expect-utils';
import * as matcherUtils from 'jest-matcher-utils';
import type {
  ExpectHost,
  RunMatcherOptions,
  SemanticMatcherFn,
} from '@semantic-matchers/core';
import {adaptMatcher} from './adaptMatcher.js';
import {executeSemanticMatcher} from './executeMatcher.js';
import {JestAssertionError} from './JestAssertionError.js';

function isPromiseLike(value: unknown): value is Promise<unknown> {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as Promise<unknown>).then === 'function'
  );
}

export function createJestHost(nativeExpect: unknown): ExpectHost {
  const jestExpect = nativeExpect as {
    extend: (
      matchers: Record<string, ReturnType<typeof adaptMatcher>>,
    ) => void;
  };

  return {
    nativeExpect,
    isPromise(value: unknown): value is Promise<unknown> {
      return isPromiseLike(value);
    },
    createHostContext() {
      return {
        equals,
        utils: {
          ...matcherUtils,
          iterableEquality,
          subsetEquality,
        },
      };
    },
    runMatcher(options: RunMatcherOptions) {
      return executeSemanticMatcher(options, failure => {
        const error = new JestAssertionError(failure.message);
        error.matcherResult = {
          pass: failure.pass,
          message: failure.message,
          actual: failure.actual,
          expected: failure.expected,
        };
        error.actual = failure.actual;
        error.expected = failure.expected;
        return error;
      });
    },
    registerGlobalMatchers(matchers: Record<string, SemanticMatcherFn>) {
      const adapted = Object.fromEntries(
        Object.entries(matchers).map(([name, matcher]) => [
          name,
          adaptMatcher(matcher),
        ]),
      );
      jestExpect.extend(adapted);
    },
  };
}

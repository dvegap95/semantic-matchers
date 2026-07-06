import {equals, iterableEquality, subsetEquality} from '@jest/expect-utils';
import * as matcherUtils from 'jest-matcher-utils';
import type {ExpectHost, RunMatcherOptions, SemanticMatcherFn} from '@semantic-matchers/core';
import {
  adaptMatcher,
  executeSemanticMatcher,
  type AssertionFailure,
} from '@semantic-matchers/jest';
import {VitestExtendError} from './VitestExtendError.js';

function isPromiseLike(value: unknown): value is Promise<unknown> {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as Promise<unknown>).then === 'function'
  );
}

/**
 * Vitest host — same execution path as Jest but throws {@link VitestExtendError}
 * so failures get separated actual/expected values and Vitest-style diffs.
 */
export function createVitestHost(nativeExpect: unknown): ExpectHost {
  const vitestExpect = nativeExpect as {
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
      return executeSemanticMatcher(options, (failure: AssertionFailure) =>
        new VitestExtendError(
          failure.message,
          failure.actual,
          failure.expected,
        ),
      );
    },
    registerGlobalMatchers(matchers: Record<string, SemanticMatcherFn>) {
      const adapted = Object.fromEntries(
        Object.entries(matchers).map(([name, matcher]) => [
          name,
          adaptMatcher(matcher),
        ]),
      );
      vitestExpect.extend(adapted);
    },
  };
}

import type {ExpectPath, ExpectPathSegment} from './types.js';
import {EMPTY_EXPECT_PATH} from './types.js';

const EXPECT_PATH_SEGMENTS = new Set<string>(['not', 'resolves', 'rejects']);

export function appendExpectPath(
  path: ExpectPath,
  segment: ExpectPathSegment,
): ExpectPath {
  if (segment === 'not') {
    return {...path, negated: !path.negated};
  }
  return {...path, promise: segment};
}

export type MatcherResolver = (path: ExpectPath, name: string) => unknown;

export function createExpectationProxy(
  resolveMatcher: MatcherResolver,
  path: ExpectPath = EMPTY_EXPECT_PATH,
): unknown {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        if (typeof prop === 'symbol') {
          return undefined;
        }
        if (EXPECT_PATH_SEGMENTS.has(prop)) {
          return createExpectationProxy(
            resolveMatcher,
            appendExpectPath(path, prop as ExpectPathSegment),
          );
        }
        return resolveMatcher(path, prop);
      },
    },
  );
}

import type {ExpectHost, RunMatcherOptions} from '../../host.js';
import type {ExpectPath} from '../../types.js';

export type MockHostCall = {
  type: 'runMatcher' | 'native';
  matcherName: string;
  actual: unknown;
  args: Array<unknown>;
  path: ExpectPath;
  context?: RunMatcherOptions['context'];
};

export function createMockHost(
  nativeMatchers: Record<string, (...args: Array<unknown>) => unknown> = {},
): ExpectHost & {calls: Array<MockHostCall>} {
  const calls: Array<MockHostCall> = [];

  const nativeExpect = (actual: unknown) => {
    const makeChain = (path: ExpectPath) =>
      new Proxy(
        {},
        {
          get(_target, prop) {
            if (typeof prop === 'symbol') {
              return undefined;
            }
            if (prop === 'not') {
              return makeChain({...path, negated: !path.negated});
            }
            if (prop === 'resolves') {
              return makeChain({...path, promise: 'resolves'});
            }
            if (prop === 'rejects') {
              return makeChain({...path, promise: 'rejects'});
            }
            const matcher = nativeMatchers[prop];
            if (!matcher) {
              return undefined;
            }
            return (...args: Array<unknown>) => {
              calls.push({
                type: 'native',
                matcherName: prop,
                actual,
                args,
                path,
              });
              return matcher(actual, ...args);
            };
          },
        },
      );

    return makeChain({negated: false, promise: null});
  };

  return {
    calls,
    nativeExpect,
    isPromise(value: unknown): value is Promise<unknown> {
      return (
        value !== null &&
        typeof value === 'object' &&
        typeof (value as Promise<unknown>).then === 'function'
      );
    },
    runMatcher(options: RunMatcherOptions) {
      calls.push({
        type: 'runMatcher',
        matcherName: options.matcherName,
        actual: options.actual,
        args: options.args,
        path: options.path,
        context: options.context,
      });
      return (
        options.matcher as (
          ...fnArgs: Array<unknown>
        ) => ReturnType<typeof options.matcher.call>
      ).call(options.context, options.actual, ...options.args);
    },
    createHostContext() {
      return {};
    },
  };
}

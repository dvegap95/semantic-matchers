import type {ExpectHost} from './host.js';
import type {MatcherLibrary} from './defineMatchers.js';
import {registerClassMatchers} from './registry.js';
import {createMatcherRegistry, type MatcherRegistry} from './registry.js';
import {resolveActiveMatcher} from './resolver.js';
import {createExpectationProxy} from './proxy.js';
import type {ClassConstructor, ExpectPath} from './types.js';

export type CreateSemanticExpectOptions = {
  host: ExpectHost;
  registry?: MatcherRegistry;
  libraries?: MatcherLibrary;
};

/**
 * Factory entry point — adapters call this, then expose the result as `expect`.
 *
 * @status Stub — full dispatch (promises, baseMatcher, errors) lands in implementation phase.
 */
export function createSemanticExpect(options: CreateSemanticExpectOptions) {
  const registry = options.registry ?? createMatcherRegistry();

  if (options.libraries) {
    for (const bundle of options.libraries) {
      registerClassMatchers(registry, bundle.Class, bundle.matchers);
    }
  }

  const expectFn = (actual: unknown) => {
    const handler = (path: ExpectPath, name: string) => {
      const matcher = resolveActiveMatcher(
        registry,
        name,
        (actual as {constructor?: ClassConstructor})?.constructor,
      );
      if (!matcher) {
        throw new Error(`Matcher "${name}" not found`);
      }
      return options.host.runMatcher({
        matcher,
        actual,
        args: [],
        path,
        matcherName: name,
        context: {
          isNot: path.negated,
          promise: path.promise,
          matchers: {},
          rawMatchers: {},
          host: options.host.createHostContext({
            actual,
            matcherName: name,
            path,
            args: [],
            hostBag: {},
          }),
        },
      });
    };
    return createExpectationProxy(handler);
  };

  return Object.assign(expectFn, {
    registry,
    /** Register class-scoped matchers at runtime (mirrors expect.extend(matchers, Class)). */
    extendClass<T extends ClassConstructor>(
      matchers: Record<string, import('./types.js').SemanticMatcherFn>,
      Class: T,
    ) {
      registerClassMatchers(registry, Class, matchers);
    },
  });
}

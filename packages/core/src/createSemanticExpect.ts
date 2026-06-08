import type {ExpectHost, HostRunState} from './host.js';
import type {MatcherLibrary} from './defineMatchers.js';
import {
  createMatcherRegistry,
  registerClassMatchers,
  registerGlobalMatchers,
  resetMatcherRegistry,
  type MatcherRegistry,
} from './registry.js';
import {
  resolveActiveMatcher,
  resolveAllMatchersForClass,
} from './resolver.js';
import {buildMatcherContext, getClassConstructor} from './matcherContext.js';
import {delegateToNative} from './nativeDelegate.js';
import {createRejectMatcher, createResolveMatcher} from './promiseMatchers.js';
import {createExpectationProxy} from './proxy.js';
import type {ExpectationFor} from './types/inference.js';
import type {ClassConstructor, ExpectPath, SemanticMatcherFn} from './types.js';

export type CreateSemanticExpectOptions = {
  host: ExpectHost;
  registry?: MatcherRegistry;
  libraries?: MatcherLibrary;
};

export type SemanticExpect = {
  <T>(actual: T): ExpectationFor<T>;
  registry: MatcherRegistry;
  host: ExpectHost;
  extend(
    matchers: Record<string, SemanticMatcherFn>,
    classConstructor?: ClassConstructor,
  ): void;
  extendClass<T extends ClassConstructor>(
    matchers: Record<string, SemanticMatcherFn>,
    Class: T,
  ): void;
  extendGlobal(
    matchers: Record<string, SemanticMatcherFn>,
    options?: {preservePreviousAsFallback?: boolean},
  ): void;
  getMatchers(classConstructor?: ClassConstructor): Record<string, SemanticMatcherFn>;
  /** Reset registry state — clears class and global matchers. */
  resetMatchers(): void;
};

/**
 * Factory entry point — adapters call this, then expose the result as `expect`.
 */
export function createSemanticExpect(options: CreateSemanticExpectOptions) {
  const {host} = options;
  const registry = options.registry ?? createMatcherRegistry();

  if (options.libraries) {
    for (const bundle of options.libraries) {
      registerClassMatchers(registry, bundle.Class, bundle.matchers);
    }
  }

  function invokeMatcher(
    settled: unknown,
    args: Array<unknown>,
    path: ExpectPath,
    matcherName: string,
  ): unknown {
    const classConstructor = getClassConstructor(settled);
    const matcher = resolveActiveMatcher(registry, matcherName, classConstructor);
    if (!matcher) {
      return delegateToNative(host, settled, path, matcherName)(...args);
    }

    const state: HostRunState = {
      actual: settled,
      matcherName,
      path,
      args,
      hostBag: {},
    };

    return host.runMatcher({
      matcher,
      actual: settled,
      args,
      path,
      matcherName,
      context: buildMatcherContext(registry, host, state),
    });
  }

  const expectFn = (actual: unknown, ...rest: Array<unknown>) => {
    if (rest.length > 0) {
      throw new Error('Expect takes at most one argument.');
    }

    const handler = (path: ExpectPath, matcherName: string) => {
      if (path.promise === 'resolves') {
        return createResolveMatcher(
          host,
          actual,
          path,
          matcherName,
          (result, args) => invokeMatcher(result, args, path, matcherName),
        );
      }

      if (path.promise === 'rejects') {
        return createRejectMatcher(
          host,
          actual,
          path,
          matcherName,
          (error, args) => invokeMatcher(error, args, path, matcherName),
        );
      }

      const classConstructor = getClassConstructor(actual);
      const matcher = resolveActiveMatcher(
        registry,
        matcherName,
        classConstructor,
      );
      if (!matcher) {
        return delegateToNative(host, actual, path, matcherName);
      }

      return (...args: Array<unknown>) =>
        invokeMatcher(actual, args, path, matcherName);
    };

    return createExpectationProxy(handler);
  };

  return Object.assign(expectFn, {
    registry,
    host,

    extend(
      matchers: Record<string, SemanticMatcherFn>,
      classConstructor?: ClassConstructor,
    ) {
      if (classConstructor) {
        registerClassMatchers(registry, classConstructor, matchers);
      } else {
        registerGlobalMatchers(registry, matchers, {
          preservePreviousAsFallback: true,
        });
        host.registerGlobalMatchers?.(matchers);
      }
    },

    extendClass<T extends ClassConstructor>(
      matchers: Record<string, SemanticMatcherFn>,
      Class: T,
    ) {
      registerClassMatchers(registry, Class, matchers);
    },

    extendGlobal(
      matchers: Record<string, SemanticMatcherFn>,
      options?: {preservePreviousAsFallback?: boolean},
    ) {
      registerGlobalMatchers(registry, matchers, options);
      host.registerGlobalMatchers?.(matchers);
    },

    getMatchers(classConstructor?: ClassConstructor) {
      return resolveAllMatchersForClass(registry, classConstructor);
    },

    resetMatchers() {
      resetMatcherRegistry(registry);
    },
  }) as SemanticExpect;
}

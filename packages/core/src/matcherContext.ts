import type {ExpectHost, HostRunState} from './host.js';
import type {MatcherRegistry} from './registry.js';
import {
  resolveAllMatchersForClass,
  resolveEncapsulatedFallbackMatcherForClass,
} from './resolver.js';
import type {ClassConstructor, SemanticMatcherContext} from './types.js';

export function getClassConstructor(
  value: unknown,
): ClassConstructor | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  const ctor = (value as {constructor?: ClassConstructor}).constructor;
  if (!ctor || ctor === Object) {
    return undefined;
  }
  return ctor;
}

export function buildMatcherContext(
  registry: MatcherRegistry,
  host: ExpectHost,
  state: HostRunState,
): SemanticMatcherContext {
  const classConstructor = getClassConstructor(state.actual);
  return {
    isNot: state.path.negated,
    promise: state.path.promise,
    baseMatcher: resolveEncapsulatedFallbackMatcherForClass(
      registry,
      state.matcherName,
      classConstructor,
    ),
    matchers: resolveAllMatchersForClass(registry, classConstructor),
    rawMatchers: resolveAllMatchersForClass(registry, undefined),
    host: host.createHostContext(state),
  };
}

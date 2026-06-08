import type {
  ClassConstructor,
  SemanticMatcherFn,
  SemanticMatchersObject,
} from './types.js';

export type FallbackStack = Array<SemanticMatcherFn>;

export type GlobalRegistry = {
  matchers: SemanticMatchersObject;
  fallbacks: Record<string, FallbackStack>;
};

export type ClassRegistry = WeakMap<
  ClassConstructor,
  SemanticMatchersObject
>;

export type MatcherRegistry = {
  global: GlobalRegistry;
  class: ClassRegistry;
};

export function createMatcherRegistry(): MatcherRegistry {
  return {
    global: {
      matchers: Object.create(null) as SemanticMatchersObject,
      fallbacks: Object.create(null) as Record<string, FallbackStack>,
    },
    class: new WeakMap(),
  };
}

export function registerClassMatchers(
  registry: MatcherRegistry,
  classConstructor: ClassConstructor,
  matchers: SemanticMatchersObject,
): void {
  const existing =
    registry.class.get(classConstructor) ??
    (Object.create(null) as SemanticMatchersObject);
  Object.assign(existing, matchers);
  registry.class.set(classConstructor, existing);
}

export function registerGlobalMatchers(
  registry: MatcherRegistry,
  matchers: SemanticMatchersObject,
  options?: {preservePreviousAsFallback?: boolean},
): void {
  if (options?.preservePreviousAsFallback) {
    for (const name of Object.keys(matchers)) {
      const previous = registry.global.matchers[name];
      if (previous) {
        registry.global.fallbacks[name] ??= [];
        registry.global.fallbacks[name].push(previous);
      }
    }
  }
  Object.assign(registry.global.matchers, matchers);
}

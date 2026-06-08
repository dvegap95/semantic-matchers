import type {MatcherRegistry} from './registry.js';
import type {
  ClassConstructor,
  SemanticMatcherFn,
  SemanticMatchersObject,
} from './types.js';

function walkPrototypeChain(
  constructorFn: ClassConstructor | undefined,
): Array<ClassConstructor> {
  const chain: Array<ClassConstructor> = [];
  let current = constructorFn;
  while (current) {
    chain.push(current);
    const proto = Object.getPrototypeOf(current.prototype);
    current = proto?.constructor as ClassConstructor | undefined;
    if (current === Object || current === Function) {
      break;
    }
  }
  return chain;
}

export function resolveClassMatcher(
  registry: MatcherRegistry,
  name: string,
  classConstructor?: ClassConstructor,
): SemanticMatcherFn | undefined {
  for (const ctor of walkPrototypeChain(classConstructor)) {
    const classMatchers = registry.class.get(ctor);
    if (classMatchers?.[name]) {
      return classMatchers[name];
    }
  }
  return undefined;
}

export function* resolveMatcherHierarchyForClass(
  registry: MatcherRegistry,
  name: string,
  classConstructor?: ClassConstructor,
): Generator<SemanticMatcherFn> {
  for (const ctor of walkPrototypeChain(classConstructor)) {
    const classMatchers = registry.class.get(ctor);
    if (classMatchers?.[name]) {
      yield classMatchers[name];
    }
  }
  const globalMatcher = registry.global.matchers[name];
  if (globalMatcher) {
    yield globalMatcher;
  }
  for (const fallback of registry.global.fallbacks[name] ?? []) {
    yield fallback;
  }
}

export function resolveActiveMatcher(
  registry: MatcherRegistry,
  name: string,
  classConstructor?: ClassConstructor,
): SemanticMatcherFn | undefined {
  return resolveMatcherHierarchyForClass(
    registry,
    name,
    classConstructor,
  ).next().value;
}

export function resolveFallbackChain(
  registry: MatcherRegistry,
  name: string,
  classConstructor?: ClassConstructor,
): Array<SemanticMatcherFn> {
  return [...resolveMatcherHierarchyForClass(registry, name, classConstructor)];
}

/**
 * Builds a nested `baseMatcher` that delegates through the full hierarchy
 * (subclass → superclass → global → fallback stack).
 */
export function resolveEncapsulatedFallbackMatcherForClass(
  registry: MatcherRegistry,
  matcherName: string,
  classConstructor?: ClassConstructor,
  parentMatcherIndex = 0,
  matchersArray: Array<SemanticMatcherFn> = [
    ...resolveMatcherHierarchyForClass(registry, matcherName, classConstructor),
  ],
): SemanticMatcherFn | undefined {
  const baseMatcher = matchersArray[++parentMatcherIndex];
  if (!baseMatcher) {
    return undefined;
  }

  return function (this: {parentMatcherIndex?: number}, ...args: Array<unknown>) {
    const index = this.parentMatcherIndex
      ? this.parentMatcherIndex + 1
      : parentMatcherIndex;
    const context = {
      ...this,
      baseMatcher: resolveEncapsulatedFallbackMatcherForClass(
        registry,
        matcherName,
        classConstructor,
        index,
        matchersArray,
      ),
      parentMatcherIndex: index,
    };
    return (baseMatcher as (...fnArgs: Array<unknown>) => unknown).call(
      context,
      ...args,
    );
  } as SemanticMatcherFn;
}

export function resolveAllMatchersForClass(
  registry: MatcherRegistry,
  classConstructor?: ClassConstructor,
): SemanticMatchersObject {
  return new Proxy(Object.create(null) as SemanticMatchersObject, {
    get(_target, prop) {
      if (typeof prop === 'symbol') {
        return undefined;
      }
      return resolveActiveMatcher(registry, String(prop), classConstructor);
    },
  });
}

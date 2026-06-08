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

export function resolveActiveMatcher(
  registry: MatcherRegistry,
  name: string,
  classConstructor?: ClassConstructor,
): SemanticMatcherFn | undefined {
  return (
    resolveClassMatcher(registry, name, classConstructor) ??
    registry.global.matchers[name]
  );
}

export function resolveFallbackChain(
  registry: MatcherRegistry,
  name: string,
  classConstructor?: ClassConstructor,
): Array<SemanticMatcherFn> {
  const chain: Array<SemanticMatcherFn> = [];
  const classMatcher = resolveClassMatcher(registry, name, classConstructor);
  if (classMatcher) {
    chain.push(classMatcher);
  }
  const globalMatcher = registry.global.matchers[name];
  if (globalMatcher && globalMatcher !== classMatcher) {
    chain.push(globalMatcher);
  }
  chain.push(...(registry.global.fallbacks[name] ?? []));
  return chain;
}

export function resolveAllMatchersForClass(
  registry: MatcherRegistry,
  classConstructor?: ClassConstructor,
): SemanticMatchersObject {
  const merged = Object.create(null) as SemanticMatchersObject;
  const chain = walkPrototypeChain(classConstructor).reverse();
  for (const ctor of chain) {
    const matchers = registry.class.get(ctor);
    if (matchers) {
      Object.assign(merged, matchers);
    }
  }
  Object.assign(merged, registry.global.matchers);
  return merged;
}

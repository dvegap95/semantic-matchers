import {describe, expect, it} from 'vitest';
import {
  createMatcherRegistry,
  registerClassMatchers,
  registerGlobalMatchers,
} from '../registry.js';
import {
  resolveActiveMatcher,
  resolveClassMatcher,
  resolveEncapsulatedFallbackMatcherForClass,
  resolveFallbackChain,
  resolveMatcherHierarchyForClass,
} from '../resolver.js';
import type {SemanticMatcherContext} from '../types.js';

class Entity {
  id = 'e1';
}
class User extends Entity {
  email = 'a@b.c';
}

describe('resolveClassMatcher', () => {
  it('walks the prototype chain from most specific to base', () => {
    const registry = createMatcherRegistry();
    registerClassMatchers(registry, Entity, {
      toMatchIdentity() {
        return {pass: true, message: () => 'entity'};
      },
    });
    registerClassMatchers(registry, User, {
      toHaveEmail() {
        return {pass: true, message: () => 'user'};
      },
    });

    const user = new User();
    expect(
      resolveClassMatcher(registry, 'toHaveEmail', User)?.call({} as any, user),
    ).toEqual({pass: true, message: expect.any(Function)});

    expect(resolveActiveMatcher(registry, 'toMatchIdentity', User)).toBeDefined();
  });
});

describe('resolveMatcherHierarchyForClass', () => {
  it('yields subclass, superclass, global, then fallbacks in order', () => {
    const registry = createMatcherRegistry();
    const entityMatcher = () => ({pass: true, message: () => 'entity'});
    const userMatcher = () => ({pass: true, message: () => 'user'});
    const globalMatcher = () => ({pass: true, message: () => 'global'});
    const newGlobalMatcher = () => ({pass: true, message: () => 'new global'});

    registerClassMatchers(registry, Entity, {toMatch: entityMatcher});
    registerClassMatchers(registry, User, {toMatch: userMatcher});
    registerGlobalMatchers(registry, {toMatch: globalMatcher});
    registerGlobalMatchers(
      registry,
      {toMatch: newGlobalMatcher},
      {preservePreviousAsFallback: true},
    );

    const hierarchy = [
      ...resolveMatcherHierarchyForClass(registry, 'toMatch', User),
    ];
    expect(hierarchy).toEqual([
      userMatcher,
      entityMatcher,
      newGlobalMatcher,
      globalMatcher,
    ]);
  });
});

describe('resolveActiveMatcher', () => {
  it('prefers subclass override over superclass and global', () => {
    const registry = createMatcherRegistry();
    const userMatcher = () => ({pass: true, message: () => 'user'});
    registerClassMatchers(registry, Entity, {
      toMatch() {
        return {pass: true, message: () => 'entity'};
      },
    });
    registerClassMatchers(registry, User, {toMatch: userMatcher});
    registerGlobalMatchers(registry, {
      toMatch() {
        return {pass: true, message: () => 'global'};
      },
    });

    expect(resolveActiveMatcher(registry, 'toMatch', User)).toBe(userMatcher);
  });

  it('falls back to global when actual has no class matchers', () => {
    const registry = createMatcherRegistry();
    const globalMatcher = () => ({pass: true, message: () => 'global'});
    registerGlobalMatchers(registry, {toMatch: globalMatcher});

    expect(resolveActiveMatcher(registry, 'toMatch', undefined)).toBe(
      globalMatcher,
    );
    expect(resolveActiveMatcher(registry, 'toMatch', String as any)).toBe(
      globalMatcher,
    );
    expect(resolveActiveMatcher(registry, 'toMatch', null as any)).toBe(
      globalMatcher,
    );
  });
});

describe('resolveFallbackChain', () => {
  it('includes the full global fallback stack', () => {
    const registry = createMatcherRegistry();
    const v1 = () => ({pass: true, message: () => 'v1'});
    const v2 = () => ({pass: true, message: () => 'v2'});
    const v3 = () => ({pass: true, message: () => 'v3'});

    registerGlobalMatchers(registry, {toEqual: v1});
    registerGlobalMatchers(registry, {toEqual: v2}, {
      preservePreviousAsFallback: true,
    });
    registerGlobalMatchers(registry, {toEqual: v3}, {
      preservePreviousAsFallback: true,
    });

    const chain = resolveFallbackChain(registry, 'toEqual', undefined);
    expect(chain).toEqual([v3, v2, v1]);
  });
});

describe('resolveEncapsulatedFallbackMatcherForClass', () => {
  it('chains baseMatcher through class hierarchy', () => {
    const registry = createMatcherRegistry();
    const calls: Array<string> = [];

    registerClassMatchers(registry, Entity, {
      toMatch(actual) {
        calls.push(`entity:${actual}`);
        return {pass: true, message: () => 'entity'};
      },
    });
    registerClassMatchers(registry, User, {
      toMatch(this: SemanticMatcherContext, actual) {
        calls.push(`user:${actual}`);
        this.baseMatcher?.(actual);
        return {pass: true, message: () => 'user'};
      },
    });

    const active = resolveActiveMatcher(registry, 'toMatch', User)!;
    const baseMatcher = resolveEncapsulatedFallbackMatcherForClass(
      registry,
      'toMatch',
      User,
    );

    active.call({baseMatcher} as SemanticMatcherContext, 'value');

    expect(calls).toEqual(['user:value', 'entity:value']);
  });

  it('chains through global fallback stack', () => {
    const registry = createMatcherRegistry();
    const calls: Array<string> = [];

    registerGlobalMatchers(registry, {
      toEqual() {
        calls.push('v1');
        return {pass: true, message: () => 'v1'};
      },
    });
    registerGlobalMatchers(
      registry,
      {
        toEqual(this: SemanticMatcherContext) {
          calls.push('v2');
          this.baseMatcher?.();
          return {pass: true, message: () => 'v2'};
        },
      },
      {preservePreviousAsFallback: true},
    );

    const active = resolveActiveMatcher(registry, 'toEqual', undefined)!;
    const baseMatcher = resolveEncapsulatedFallbackMatcherForClass(
      registry,
      'toEqual',
      undefined,
    );

    active.call({baseMatcher} as SemanticMatcherContext, 'x');

    expect(calls).toEqual(['v2', 'v1']);
  });

  it('returns undefined when there is no parent matcher', () => {
    const registry = createMatcherRegistry();
    registerGlobalMatchers(registry, {
      toEqual() {
        return {pass: true, message: () => 'only'};
      },
    });

    expect(
      resolveEncapsulatedFallbackMatcherForClass(
        registry,
        'toEqual',
        undefined,
      ),
    ).toBeUndefined();
  });
});

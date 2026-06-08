import {describe, expect, it} from 'vitest';
import {createSemanticExpect} from '../createSemanticExpect.js';
import {
  createMatcherRegistry,
  registerClassMatchers,
  registerGlobalMatchers,
} from '../registry.js';
import {createMockHost} from './helpers/mockHost.js';

/// <reference path="./matchers.d.ts" />

class User {
  email = 'a@b.c';
}

describe('createSemanticExpect', () => {
  it('runs a class matcher via the host with full context', () => {
    const host = createMockHost();
    const registry = createMatcherRegistry();
    registerClassMatchers(registry, User, {
      toHaveEmail(actual, email) {
        return {
          pass: (actual as User).email === email,
          message: () => 'email mismatch',
        };
      },
    });

    const semanticExpect = createSemanticExpect({host, registry});
    const user = new User();

    semanticExpect(user).toHaveEmail('a@b.c');

    expect(host.calls).toHaveLength(1);
    expect(host.calls[0]).toMatchObject({
      type: 'runMatcher',
      matcherName: 'toHaveEmail',
      actual: user,
      args: ['a@b.c'],
      path: {negated: false, promise: null},
    });
    expect(typeof host.calls[0].context?.matchers?.toHaveEmail).toBe('function');
    expect(host.calls[0].context?.baseMatcher).toBeUndefined();
  });

  it('delegates unknown matchers to nativeExpect', () => {
    const host = createMockHost({
      toEqual(actual, expected) {
        return actual === expected;
      },
    });
    const semanticExpect = createSemanticExpect({host});

    semanticExpect('x').toEqual('x');

    expect(host.calls).toEqual([
      {
        type: 'native',
        matcherName: 'toEqual',
        actual: 'x',
        args: ['x'],
        path: {negated: false, promise: null},
      },
    ]);
  });

  it('delegates negated unknown matchers through native .not', () => {
    const host = createMockHost({
      toEqual(actual, expected) {
        return actual === expected;
      },
    });
    const semanticExpect = createSemanticExpect({host});

    semanticExpect('x').not.toEqual('y');

    expect(host.calls[0].path).toEqual({negated: true, promise: null});
  });

  it('resolves matchers against the settled value constructor', async () => {
    const host = createMockHost();
    const registry = createMatcherRegistry();
    registerClassMatchers(registry, User, {
      toHaveEmail(actual, email) {
        return {
          pass: (actual as User).email === email,
          message: () => 'email mismatch',
        };
      },
    });

    const semanticExpect = createSemanticExpect({host, registry});
    const settled = new User();

    await semanticExpect(Promise.resolve(settled)).resolves.toHaveEmail('a@b.c');

    expect(host.calls).toHaveLength(1);
    expect(host.calls[0].actual).toBe(settled);
    expect(host.calls[0].path.promise).toBe('resolves');
  });

  it('rejects matchers against the rejection reason constructor', async () => {
    class CustomError extends Error {
      code = 'E_FAIL';
    }

    const host = createMockHost();
    const registry = createMatcherRegistry();
    registerClassMatchers(registry, CustomError as import('../types.js').ClassConstructor, {
      toHaveCode(actual, code) {
        return {
          pass: (actual as CustomError).code === code,
          message: () => 'code mismatch',
        };
      },
    });

    const semanticExpect = createSemanticExpect({host, registry});
    const error = new CustomError('failed');

    await semanticExpect(Promise.reject(error)).rejects.toHaveCode('E_FAIL');

    expect(host.calls).toHaveLength(1);
    expect(host.calls[0].actual).toBe(error);
    expect(host.calls[0].path.promise).toBe('rejects');
  });

  it('extend registers global matchers with fallback preservation', () => {
    const host = createMockHost();
    const semanticExpect = createSemanticExpect({host});
    const v1 = () => ({pass: true, message: () => 'v1'});
    const v2 = () => ({pass: true, message: () => 'v2'});

    semanticExpect.extend({toMatch: v1});
    semanticExpect.extend({toMatch: v2});

    const chain = [
      ...semanticExpect.registry.global.fallbacks.toMatch ?? [],
      semanticExpect.registry.global.matchers.toMatch,
    ];
    expect(chain).toEqual([v1, v2]);
  });

  it('extend with a class registers class matchers', () => {
    const host = createMockHost();
    const semanticExpect = createSemanticExpect({host});

    semanticExpect.extend(
      {
        toHaveEmail() {
          return {pass: true, message: () => 'ok'};
        },
      },
      User,
    );

    expect(typeof semanticExpect.getMatchers(User).toHaveEmail).toBe('function');
  });

  it('getMatchers resolves class hierarchy and globals per name', () => {
    const host = createMockHost();
    const registry = createMatcherRegistry();
    class Entity {}
    class ExtendedUser extends Entity {}
    class Admin extends ExtendedUser {}

    registerClassMatchers(registry, ExtendedUser, {
      toHaveEmail() {
        return {pass: true, message: () => 'user'};
      },
    });

    registerClassMatchers(registry, Entity, {
      toMatchEntity() {
        return {pass: true, message: () => 'entity'};
      },
    });
    registerGlobalMatchers(registry, {
      toBeTruthy() {
        return {pass: true, message: () => 'global'};
      },
    });

    const semanticExpect = createSemanticExpect({host, registry});
    const matchers = semanticExpect.getMatchers(Admin);

    expect(typeof matchers.toMatchEntity).toBe('function');
    expect(typeof matchers.toHaveEmail).toBe('function');
    expect(typeof matchers.toBeTruthy).toBe('function');
  });
});

import {describe, expect, it} from 'vitest';
import {createMatcherRegistry, registerClassMatchers} from '../registry.js';
import {resolveActiveMatcher, resolveClassMatcher} from '../resolver.js';

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

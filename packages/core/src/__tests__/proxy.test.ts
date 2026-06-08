import {describe, expect, it} from 'vitest';
import {EMPTY_EXPECT_PATH} from '../types.js';
import {createExpectationProxy} from '../proxy.js';
import type {ExpectPath} from '../types.js';

describe('createExpectationProxy', () => {
  it('resolves matcher names on the default path', () => {
    const paths: Array<ExpectPath> = [];
    const proxy = createExpectationProxy((path, name) => {
      paths.push(path);
      return name;
    }) as {toFoo: string};

    expect(proxy.toFoo).toBe('toFoo');
    expect(paths).toEqual([EMPTY_EXPECT_PATH]);
  });

  it('accumulates .not on the path', () => {
    const paths: Array<ExpectPath> = [];
    const proxy = createExpectationProxy((path, name) => {
      paths.push(path);
      return name;
    }) as {not: {toFoo: string}};

    expect(proxy.not.toFoo).toBe('toFoo');
    expect(paths).toEqual([{negated: true, promise: null}]);
  });

  it('sets .resolves and .rejects on the path', () => {
    const paths: Array<ExpectPath> = [];
    const proxy = createExpectationProxy((path, name) => {
      paths.push(path);
      return name;
    }) as {
      resolves: {toFoo: string};
      rejects: {toBar: string};
    };

    expect(proxy.resolves.toFoo).toBe('toFoo');
    expect(proxy.rejects.toBar).toBe('toBar');
    expect(paths).toEqual([
      {negated: false, promise: 'resolves'},
      {negated: false, promise: 'rejects'},
    ]);
  });

  it('preserves chaining order: .not.resolves', () => {
    const paths: Array<ExpectPath> = [];
    const proxy = createExpectationProxy((path, name) => {
      paths.push(path);
      return name;
    }) as {not: {resolves: {toFoo: string}}};

    expect(proxy.not.resolves.toFoo).toBe('toFoo');
    expect(paths).toEqual([{negated: true, promise: 'resolves'}]);
  });

  it('toggles .not twice back to unnegated', () => {
    const paths: Array<ExpectPath> = [];
    const proxy = createExpectationProxy((path, name) => {
      paths.push(path);
      return name;
    }) as {not: {not: {toFoo: string}}};

    expect(proxy.not.not.toFoo).toBe('toFoo');
    expect(paths).toEqual([{negated: false, promise: null}]);
  });
});

/**
 * Reference: prototype-style class hierarchy + `expect.extend`.
 *
 * Copy patterns into your test setup — not executed as part of CI.
 */
import type {
  ExtendedMatchersForClass,
  MatchersObject,
} from '@semantic-matchers/core';

class A {
  foo = 'bar';
  get num() {
    return 1;
  }
}

class B extends A {
  foo2 = 'bar2';
  _num: number;
  constructor(num = 2) {
    super();
    this._num = num;
  }
  override get num() {
    return this._num;
  }
}

class C extends B {
  foo3 = 'bar3';
}

class D {
  foo4 = 'bar4';
}

declare module '@semantic-matchers/core' {
  interface SemanticMatchers<R> {
    toBeMultipleOf(expected: number): R;
    toHaveColor(expected: string): R;
    toHaveNum(expected: number): R;
  }

  interface SemanticClassMatcherMap<R> {
    A: ExtendedMatchersForClass<
      A,
      R,
      {
        toHaveNum(expected: number): R;
        toHaveFoo(expected: string): R;
      }
    >;
    B: ExtendedMatchersForClass<
      B,
      R,
      {
        toHaveFoo(expected: string): R;
      }
    >;
    C: ExtendedMatchersForClass<
      C,
      R,
      {
        toBeMultipleOf(expected: number): R;
        toHaveNum(expected: number): R;
      }
    >;
    D: ExtendedMatchersForClass<
      D,
      R,
      {
        toHaveOtherProperty(expected: string): R;
      }
    >;
  }
}

export const matchersA: MatchersObject<A> = {
  toHaveFoo(actual, expected: string) {
    return {
      pass: actual.foo === expected,
      message: () => 'foo is not bar',
    };
  },
  toHaveNum(actual, expected: number) {
    return {
      pass: actual.num === expected,
      message: () => 'num mismatch',
    };
  },
};

export const matchersB: MatchersObject<B> = {
  toHaveFoo(actual, expected: string) {
    return {
      pass: actual.foo2 === expected,
      message: () => 'foo2 is not bar2',
    };
  },
};

export const rawMatchers: MatchersObject = {
  toBeMultipleOf(actual: number, expected: number) {
    return {
      pass: actual % expected === 0,
      message: () => `number ${actual} is not a multiple of ${expected}`,
    };
  },
  toHaveColor(_actual, expected: string) {
    return {
      pass: expected === 'red',
      message: () => 'color is not red',
    };
  },
  toHaveNum(_actual, expected: number) {
    return {
      pass: expected === 1234,
      message: () => 'num mismatch',
    };
  },
};

// In setup (after installSemanticExpect) — either approach:
//
//   expect.extend(matchersA, A);
//   expect.extend(matchersB, B);
//   expect.extend(rawMatchers);
//
// Or with a pack:
//   installSemanticExpect(nativeExpect, { libraries: defineMatcherLibrary([...]) });
//
// In tests:
//
//   expect(new A()).toHaveFoo('bar');
//   expect(new B()).toHaveNum(2);           // falls back to A.toHaveNum
//   expect(new D()).toHaveNum(1234);       // falls back to rawMatchers
//   expect(6).toBeMultipleOf(3);            // global matcher

export {A, B, C, D};

import type {SemanticExpect} from '@semantic-matchers/core';
import type {SemanticMatcherContext, SemanticMatcherFn} from '@semantic-matchers/core';
import {describe, expect as runnerExpect, it, vi, beforeEach} from 'vitest';

export class A {
  foo = 'bar';
  get num() {
    return 1;
  }
}

export class B extends A {
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

export class C extends B {
  foo3 = 'bar3';
  override get num() {
    return this._num;
  }
}

export class D {
  foo4 = 'bar4';
}

export const passNum = 1234;
export const passColor = 'red';

export type HierarchySpies = {
  toHaveFooA: ReturnType<typeof vi.fn>;
  toHaveNumA: ReturnType<typeof vi.fn>;
  toHaveFooB: ReturnType<typeof vi.fn>;
  toBeMultipleOf: ReturnType<typeof vi.fn>;
  toHaveColor: ReturnType<typeof vi.fn>;
  toHaveNumRaw: ReturnType<typeof vi.fn>;
};

export function createHierarchyMatchers(): {
  matchersA: Record<string, SemanticMatcherFn>;
  matchersB: Record<string, SemanticMatcherFn>;
  rawMatchers: Record<string, SemanticMatcherFn>;
  spies: HierarchySpies;
} {
  const spies = {
    toHaveFooA: vi.fn(),
    toHaveNumA: vi.fn(),
    toHaveFooB: vi.fn(),
    toBeMultipleOf: vi.fn(),
    toHaveColor: vi.fn(),
    toHaveNumRaw: vi.fn(),
  };

  const matchersA: Record<string, SemanticMatcherFn> = {
    toHaveFoo(actual: A, expected: string) {
      spies.toHaveFooA(actual, expected);
      return {
        message: () => 'foo is not bar',
        pass: actual.foo === expected,
        actual: actual.foo,
        expected,
      };
    },
    toHaveNum(actual: A, expected: number) {
      spies.toHaveNumA(actual, expected);
      return {
        message: () => 'num is not 1',
        pass: actual.num === expected,
        actual: actual.num,
        expected,
      };
    },
  };

  const matchersB: Record<string, SemanticMatcherFn> = {
    toHaveFoo(actual: B, expected: string) {
      spies.toHaveFooB(actual, expected);
      return {
        message: () => 'foo2 is not bar2',
        pass: actual.foo2 === expected,
        actual: actual.foo2,
        expected,
      };
    },
  };

  const rawMatchers: Record<string, SemanticMatcherFn> = {
    toBeMultipleOf(actual: number, expected: number) {
      spies.toBeMultipleOf(actual, expected);
      return {
        message: () => `number ${actual} is not a multiple of ${expected}`,
        pass: actual % expected === 0,
        actual,
        expected,
      };
    },
    toHaveColor(_actual: unknown, expected: string) {
      spies.toHaveColor(_actual, expected);
      return {
        message: () => 'color is not red',
        pass: expected === passColor,
        expected,
      };
    },
    toHaveNum(_actual: unknown, expected: number) {
      spies.toHaveNumRaw(_actual, expected);
      return {
        message: () => 'num is not 1',
        pass: expected === passNum,
        expected,
      };
    },
  };

  return {matchersA, matchersB, rawMatchers, spies};
}

export type HierarchyConformanceHarness = {
  label: string;
  expect: SemanticExpect;
};

export function describeHierarchyConformance(
  createHarness: () => HierarchyConformanceHarness,
): void {
  describe('class matchers (A/B/C/D hierarchy)', () => {
    let harness: HierarchyConformanceHarness;
    let fixtures: ReturnType<typeof createHierarchyMatchers>;

    beforeEach(() => {
      harness = createHarness();
      fixtures = createHierarchyMatchers();
      harness.expect.resetMatchers();
      harness.expect.extend(fixtures.matchersA, A);
      harness.expect.extend(fixtures.matchersB, B);
      harness.expect.extend(fixtures.rawMatchers);
    });

    describe('extending for classes', () => {
      it('uses custom matchers defined for a class', () => {
        const a = new A();
        (harness.expect(a) as {toHaveFoo: (s: string) => void}).toHaveFoo('bar');
        runnerExpect(fixtures.spies.toHaveFooA).toHaveBeenCalledWith(a, 'bar');
      });

      it('falls back to the default matcher if not defined for a class', () => {
        const a = new A();
        (harness.expect(a) as {toHaveColor: (s: string) => void}).toHaveColor(
          passColor,
        );
        runnerExpect(fixtures.spies.toHaveColor).toHaveBeenCalledWith(
          a,
          passColor,
        );
      });

      it('falls back to the default matcher when actual is not a class instance', () => {
        (harness.expect(passNum) as {toHaveNum: (n: number) => void}).toHaveNum(
          passNum,
        );
        runnerExpect(fixtures.spies.toHaveNumRaw).toHaveBeenCalledWith(
          passNum,
          passNum,
        );
      });

      it('falls back to the default matcher for unregistered classes', () => {
        const d = new D();
        (harness.expect(d) as {toHaveNum: (n: number) => void}).toHaveNum(
          passNum,
        );
        runnerExpect(fixtures.spies.toHaveNumRaw).toHaveBeenCalledWith(
          d,
          passNum,
        );
      });

      it('uses base class matcher when not registered on the current class', () => {
        const b = new B();
        (harness.expect(b) as {toHaveNum: (n: number) => void}).toHaveNum(2);
        runnerExpect(fixtures.spies.toHaveNumA).toHaveBeenCalledWith(b, 2);
      });
    });

    describe('base matcher utils', () => {
      it('exposes the parent class matcher via baseMatcher', () => {
        const matchersC: Record<string, SemanticMatcherFn> = {
          toHaveNum(actual: C, expected: number) {
            const {baseMatcher} = this;
            const isInt = actual.num % 1 === 0;
            if (!isInt) {
              return {
                message: () => 'number is not an integer',
                pass: false,
                actual: actual.num,
                expected,
              };
            }
            return baseMatcher!.call(this, actual, expected) as {
              pass: boolean;
              message: () => string;
            };
          },
        };
        const toHaveNumCSpy = vi.spyOn(matchersC, 'toHaveNum');
        harness.expect.extend(matchersC, C);

        const c1 = new C(123);
        (harness.expect(c1) as {toHaveNum: (n: number) => void}).toHaveNum(123);
        runnerExpect(toHaveNumCSpy).toHaveBeenLastCalledWith(c1, 123);

        const c2 = new C(123.5);
        (
          harness.expect(c2) as {not: {toHaveNum: (n: number) => void}}
        ).not.toHaveNum(123.5);
        runnerExpect(toHaveNumCSpy).toHaveBeenLastCalledWith(c2, 123.5);

        (harness.expect(new B(123.5)) as {toHaveNum: (n: number) => void}).toHaveNum(
          123.5,
        );
      });

      it('uses a non-class matcher as baseMatcher when no parent has an analog', () => {
        const matchersC: Record<string, SemanticMatcherFn> = {
          toBeMultipleOf(actual: C, expected: number) {
            const {baseMatcher} = this;
            return baseMatcher!.call(this, actual.num, expected) as {
              pass: boolean;
              message: () => string;
            };
          },
        };
        const toBeMultipleOfCSpy = vi.spyOn(matchersC, 'toBeMultipleOf');
        harness.expect.extend(matchersC, C);

        const c = new C(123);
        (harness.expect(c) as {toBeMultipleOf: (n: number) => void}).toBeMultipleOf(
          3,
        );
        runnerExpect(toBeMultipleOfCSpy).toHaveBeenCalledWith(c, 3);
        runnerExpect(fixtures.spies.toBeMultipleOf).toHaveBeenCalledWith(123, 3);
      });

      it('keeps a fallback matcher for non-class overrides', () => {
        const rawOverride: Record<string, SemanticMatcherFn> = {
          toHaveColor(actual: unknown, expected: string) {
            return this.baseMatcher!.call(this, actual, expected) as {
              pass: boolean;
              message: () => string;
            };
          },
        };
        const toHaveColorSpy = vi.spyOn(rawOverride, 'toHaveColor');
        harness.expect.extend(rawOverride);

        (harness.expect(1) as {toHaveColor: (s: string) => void}).toHaveColor(
          'red',
        );
        runnerExpect(toHaveColorSpy).toHaveBeenCalledWith(1, 'red');
        runnerExpect(fixtures.spies.toHaveColor).toHaveBeenCalledWith(1, 'red');
      });
    });

    const fallbackResult = {
      message: () => 'End of the chain',
      pass: true,
    };

    function callBaseMatcherOnce(
      this: SemanticMatcherContext,
      ...args: Array<unknown>
    ) {
      return this.baseMatcher?.(...args) || fallbackResult;
    }

    function callBaseMatcherTwice(
      this: SemanticMatcherContext,
      ...args: Array<unknown>
    ) {
      this.baseMatcher?.(...args);
      return this.baseMatcher?.(...args) || fallbackResult;
    }

    const extendMatcherObjectWithSpy = (
      name: string,
      handler: SemanticMatcherFn,
      classConstructor?: new (...args: Array<unknown>) => unknown,
    ) => {
      const matchers = {[name]: handler};
      const spy = vi.spyOn(matchers, name as keyof typeof matchers);
      harness.expect.extend(matchers, classConstructor);
      return spy;
    };

    it('nests base matchers after reaching the non-class matcher (1 call each)', () => {
      const matcherName = 'toHaveChainMatcher';
      const handler = callBaseMatcherOnce;
      const spyRaw2 = extendMatcherObjectWithSpy(matcherName, handler);
      const spyRaw = extendMatcherObjectWithSpy(matcherName, handler);
      const spyA = extendMatcherObjectWithSpy(matcherName, handler, A);
      const spyB = extendMatcherObjectWithSpy(matcherName, handler, B);
      const spyC = extendMatcherObjectWithSpy(matcherName, handler, C);

      (harness.expect(new C()) as {toHaveChainMatcher: () => void}).toHaveChainMatcher();

      runnerExpect(spyC).toHaveBeenCalledTimes(1);
      runnerExpect(spyB).toHaveBeenCalledTimes(1);
      runnerExpect(spyA).toHaveBeenCalledTimes(1);
      runnerExpect(spyRaw).toHaveBeenCalledTimes(1);
      runnerExpect(spyRaw2).toHaveBeenCalledTimes(1);
    });

    it('calls nested base matchers without mixing levels (powers of 2)', () => {
      const matcherName = 'toHaveChainMatcher';
      const handler = callBaseMatcherTwice;
      const spyRaw2 = extendMatcherObjectWithSpy(matcherName, handler);
      const spyRaw = extendMatcherObjectWithSpy(matcherName, handler);
      const spyA = extendMatcherObjectWithSpy(matcherName, handler, A);
      const spyB = extendMatcherObjectWithSpy(matcherName, handler, B);
      const spyC = extendMatcherObjectWithSpy(matcherName, handler, C);

      (harness.expect(new C()) as {toHaveChainMatcher: () => void}).toHaveChainMatcher();

      runnerExpect(spyC).toHaveBeenCalledTimes(1);
      runnerExpect(spyB).toHaveBeenCalledTimes(2);
      runnerExpect(spyA).toHaveBeenCalledTimes(4);
      runnerExpect(spyRaw).toHaveBeenCalledTimes(8);
      runnerExpect(spyRaw2).toHaveBeenCalledTimes(16);
    });

    it('allows more than 2 levels of base matcher depth for non-class matchers', () => {
      const reverseMatcherSpies = Array.from({length: 10}, () =>
        extendMatcherObjectWithSpy('toHaveChainMatcher', callBaseMatcherOnce),
      );
      const matcherSpies = reverseMatcherSpies.reverse();

      (harness.expect(1) as {toHaveChainMatcher: () => void}).toHaveChainMatcher();

      for (const spy of matcherSpies) {
        runnerExpect(spy).toHaveBeenCalledTimes(1);
      }
    });

    describe('access to active matchers', () => {
      let spyRaw: ReturnType<typeof vi.fn>;
      let spyA: ReturnType<typeof vi.fn>;

      beforeEach(() => {
        const rawAccess: Record<string, SemanticMatcherFn> = {
          testMatcher() {
            return {message: () => 'test matcher', pass: true};
          },
        };
        const matchersAccessA: Record<string, SemanticMatcherFn> = {
          testAccessToClassMatchers(actual: A) {
            this.matchers.testMatcher.call(this, actual, 'test');
            return {message: () => 'accessed class matchers', pass: true};
          },
          testAccessToRawMatchers(actual: A) {
            this.rawMatchers.testMatcher.call(this, actual, 'test');
            return {message: () => 'accessed raw matchers', pass: true};
          },
          testMatcher() {
            return {message: () => 'test matcher', pass: true};
          },
        };
        spyRaw = vi.spyOn(rawAccess, 'testMatcher');
        spyA = vi.spyOn(matchersAccessA, 'testMatcher');

        harness.expect.extend(matchersAccessA, A);
        harness.expect.extend(rawAccess);
      });

      it('provides access to raw matchers within matcher context', () => {
        const a = new A();
        (
          harness.expect(a) as {testAccessToRawMatchers: () => void}
        ).testAccessToRawMatchers();

        runnerExpect(spyRaw).toHaveBeenCalledWith(a, 'test');
        runnerExpect(spyA).not.toHaveBeenCalled();
      });

      it('provides access to class matchers within matcher context', () => {
        const a = new A();
        (
          harness.expect(a) as {testAccessToClassMatchers: () => void}
        ).testAccessToClassMatchers();

        runnerExpect(spyA).toHaveBeenCalledWith(a, 'test');
        runnerExpect(spyRaw).not.toHaveBeenCalled();
      });

      it('provides access to raw matchers from expect.getMatchers()', () => {
        harness.expect.getMatchers().testMatcher.call({} as SemanticMatcherContext, 1, 'test');

        runnerExpect(spyRaw).toHaveBeenCalledWith(1, 'test');
        runnerExpect(spyA).not.toHaveBeenCalled();
      });

      it('provides access to class matchers from expect.getMatchers(Class)', () => {
        const a = new A();
        harness.expect
          .getMatchers(A)
          .testMatcher.call({} as SemanticMatcherContext, a, 'test');

        runnerExpect(spyA).toHaveBeenCalledWith(a, 'test');
        runnerExpect(spyRaw).not.toHaveBeenCalled();
        runnerExpect(harness.expect.getMatchers(A).toHaveFoo).toBeDefined();
        runnerExpect(harness.expect.getMatchers(A).toHaveNum).toBeDefined();
      });
    });

    describe('async class matchers', () => {
      it('resolves class matchers on fulfilled promises', async () => {
        const b = new B(42);
        await (
          harness.expect(Promise.resolve(b)) as {
            resolves: {toHaveNum: (n: number) => Promise<void>};
          }
        ).resolves.toHaveNum(42);
        runnerExpect(fixtures.spies.toHaveNumA).toHaveBeenCalledWith(b, 42);
      });

      it('negates class matchers on fulfilled promises', async () => {
        const b = new B(99);
        await (
          harness.expect(Promise.resolve(b)) as {
            resolves: {not: {toHaveNum: (n: number) => Promise<void>}};
          }
        ).resolves.not.toHaveNum(42);
      });

      it('resolves class matchers on rejected promises', async () => {
        const b = new B(7);
        await (
          harness.expect(Promise.reject(b)) as {
            rejects: {toHaveNum: (n: number) => Promise<void>};
          }
        ).rejects.toHaveNum(7);
      });
    });
  });
}

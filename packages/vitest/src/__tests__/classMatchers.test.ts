import {A, describeHierarchyConformance} from '@semantic-matchers/conformance';
import {describe, expect as runnerExpect, it} from 'vitest';
import {expect as vitestExpect} from 'vitest';
import {installVitestSemanticExpect, VitestExtendError} from '../index.js';

describeHierarchyConformance(() => {
  const {expect} = installVitestSemanticExpect(vitestExpect, {global: false});
  return {label: 'vitest', expect};
});

describe('vitest assertion output', () => {
  it('attaches actual and expected on matcher failure', () => {
    const {expect} = installVitestSemanticExpect(vitestExpect, {global: false});

    expect.extend(
      {
        toHaveFoo(actual: A, expected: string) {
          return {
            pass: actual.foo === expected,
            message: () => 'foo mismatch',
            actual: actual.foo,
            expected,
          };
        },
      },
      A,
    );

    let caught: VitestExtendError | undefined;
    try {
      (expect(new A()) as {toHaveFoo: (s: string) => void}).toHaveFoo('wrong');
    } catch (error) {
      caught = error as VitestExtendError;
    }

    runnerExpect(caught).toBeInstanceOf(VitestExtendError);
    runnerExpect(caught?.actual).toBe('bar');
    runnerExpect(caught?.expected).toBe('wrong');
    runnerExpect(caught?.message).toContain('foo mismatch');
  });
});

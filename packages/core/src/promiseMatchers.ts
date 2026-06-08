import type {ExpectHost} from './host.js';
import type {ExpectPath} from './types.js';

function unwrapPromiseSource(actual: unknown): unknown {
  return typeof actual === 'function'
    ? (actual as () => unknown)()
    : actual;
}

function invalidPromiseMessage(kind: 'resolves' | 'rejects'): string {
  return `received value must be a promise or a function returning a promise (${kind})`;
}

export function createResolveMatcher(
  host: ExpectHost,
  actual: unknown,
  _path: ExpectPath,
  _matcherName: string,
  onSettled: (result: unknown, args: Array<unknown>) => unknown,
): (...args: Array<unknown>) => unknown {
  return (...args: Array<unknown>) => {
    const promise = unwrapPromiseSource(actual);
    if (!host.isPromise(promise)) {
      throw new Error(invalidPromiseMessage('resolves'));
    }

    return Promise.resolve(promise).then(
      result => onSettled(result, args),
      error => {
        throw new Error(
          `Received promise rejected instead of resolved\nRejected to value: ${String(error)}`,
        );
      },
    );
  };
}

export function createRejectMatcher(
  host: ExpectHost,
  actual: unknown,
  _path: ExpectPath,
  _matcherName: string,
  onSettled: (error: unknown, args: Array<unknown>) => unknown,
): (...args: Array<unknown>) => unknown {
  return (...args: Array<unknown>) => {
    const promise = unwrapPromiseSource(actual);
    if (!host.isPromise(promise)) {
      throw new Error(invalidPromiseMessage('rejects'));
    }

    return Promise.resolve(promise).then(
      result => {
        throw new Error(
          `Received promise resolved instead of rejected\nResolved to value: ${String(result)}`,
        );
      },
      error => onSettled(error, args),
    );
  };
}

import type {ExpectHost} from './host.js';
import type {ExpectPath} from './types.js';

function buildNativeChain(
  host: ExpectHost,
  actual: unknown,
  path: ExpectPath,
): unknown {
  let chain = (host.nativeExpect as (value: unknown) => unknown)(actual);
  if (path.negated) {
    chain = (chain as {not: unknown}).not;
  }
  if (path.promise === 'resolves') {
    chain = (chain as {resolves: unknown}).resolves;
  }
  if (path.promise === 'rejects') {
    chain = (chain as {rejects: unknown}).rejects;
  }
  return chain;
}

export function resolveNativeMatcher(
  host: ExpectHost,
  actual: unknown,
  path: ExpectPath,
  matcherName: string,
): (...args: Array<unknown>) => unknown {
  const chain = buildNativeChain(host, actual, path);
  const matcher = (chain as Record<string, unknown>)[matcherName];
  if (typeof matcher !== 'function') {
    throw new Error(`Matcher "${matcherName}" not found`);
  }
  return (...args: Array<unknown>) =>
    (matcher as (...fnArgs: Array<unknown>) => unknown).apply(chain, args);
}

export function delegateToNative(
  host: ExpectHost,
  actual: unknown,
  path: ExpectPath,
  matcherName: string,
): (...args: Array<unknown>) => unknown {
  return resolveNativeMatcher(host, actual, path, matcherName);
}

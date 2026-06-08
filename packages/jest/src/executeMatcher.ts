import * as matcherUtils from 'jest-matcher-utils';
import type {
  MatcherResult,
  RunMatcherOptions,
  SemanticMatcherContext,
} from '@semantic-matchers/core';

export type AssertionFailure = {
  message: string;
  pass: boolean;
  actual?: unknown;
  expected?: unknown;
};

export type CreateAssertionError = (failure: AssertionFailure) => Error;

function flattenMatcherContext(
  context: SemanticMatcherContext,
): SemanticMatcherContext & Record<string, unknown> {
  const hostBag = context.host ?? {};
  const utils = hostBag.utils as Record<string, unknown> | undefined;
  return {
    ...context,
    ...hostBag,
    ...(utils ?? {}),
  };
}

function getMessage(message?: string | (() => string)): string {
  if (typeof message === 'function') {
    return message();
  }
  return (
    message ??
    matcherUtils.RECEIVED_COLOR('No message was specified for this matcher.')
  );
}

function validateResult(result: unknown): asserts result is MatcherResult {
  if (
    typeof result !== 'object' ||
    result === null ||
    typeof (result as MatcherResult).pass !== 'boolean' ||
    ((result as MatcherResult).message &&
      typeof (result as MatcherResult).message !== 'function')
  ) {
    throw new Error(
      `Unexpected return from a matcher function.\n` +
        `Matcher functions should return an object in the following format:\n` +
        `  {message?: () => string, pass: boolean, actual?: unknown, expected?: unknown}\n` +
        `'${matcherUtils.stringify(result)}' was returned`,
    );
  }
}

function isPromiseLike(value: unknown): value is Promise<unknown> {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as Promise<unknown>).then === 'function'
  );
}

function resolveFailureFields(
  result: MatcherResult,
  options: RunMatcherOptions,
): Pick<AssertionFailure, 'actual' | 'expected'> {
  return {
    actual: result.actual ?? options.actual,
    expected: result.expected ?? options.args[0],
  };
}

function processResult(
  result: MatcherResult,
  options: RunMatcherOptions,
  isNot: boolean,
  throwingMatcher: (...args: Array<unknown>) => unknown,
  createError: CreateAssertionError,
): void {
  const message = getMessage(result.message);
  if ((result.pass && isNot) || (!result.pass && !isNot)) {
    const error = createError({
      message,
      pass: result.pass,
      ...resolveFailureFields(result, options),
    });
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, throwingMatcher);
    }
    throw error;
  }
}

export function executeSemanticMatcher(
  options: RunMatcherOptions,
  createError: CreateAssertionError,
): unknown {
  const throwingMatcher = (...args: Array<unknown>) =>
    executeSemanticMatcher({...options, args}, createError);

  const context = flattenMatcherContext(options.context);
  const potentialResult = (
    options.matcher as (...fnArgs: Array<unknown>) => unknown
  ).call(context, options.actual, ...options.args);

  if (isPromiseLike(potentialResult)) {
    const asyncError = createError({message: '', pass: false});
    if (Error.captureStackTrace) {
      Error.captureStackTrace(asyncError, throwingMatcher);
    }

    return potentialResult
      .then(result => {
        validateResult(result);
        processResult(
          result,
          options,
          options.context.isNot,
          throwingMatcher,
          createError,
        );
      })
      .catch((error: Error & {actual?: unknown; matcherResult?: unknown}) => {
        if (error.actual !== undefined || error.matcherResult !== undefined) {
          throw error;
        }
        if (Error.captureStackTrace) {
          Error.captureStackTrace(error, throwingMatcher);
        }
        throw error;
      });
  }

  validateResult(potentialResult);
  processResult(
    potentialResult,
    options,
    options.context.isNot,
    throwingMatcher,
    createError,
  );
}

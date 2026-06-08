# Host interface

Contract between `@semantic-matchers/core` and runner adapters.

## ExpectHost

```typescript
type ExpectHost = {
  nativeExpect: unknown;
  runMatcher(options: RunMatcherOptions): unknown;
  registerGlobalMatchers?: (matchers, options?) => void;
  createHostContext(state: HostRunState): Record<string, unknown>;
};
```

### `nativeExpect`

The runner's original `expect` function. Used for:

- Delegating unknown matchers to builtins
- Asymmetric matchers (`expect.any`, …)
- Escape hatch: `installSemanticExpect({ exposeOriginalAs: 'jestExpect' })`

### `runMatcher`

**Critical adapter method.** Responsibilities:

1. Build full `SemanticMatcherContext` (including `baseMatcher` from `resolveFallbackChain`).
2. Call semantic matcher with correct `this` binding.
3. Handle sync vs async `MatcherResult`.
4. Apply `isNot` / XOR pass logic.
5. Throw runner-appropriate assertion error with `message()`.
6. For `path.promise === 'resolves' | 'rejects'`: await promise, resolve matcher using **settled value's constructor** (not `Promise`).

Prototype reference: `packages/expect/src/index.ts` — `makeThrowingMatcher`, `makeResolveMatcher`, `makeRejectMatcher`.

### `createHostContext`

Populate `ctx.host` with runner utilities without core importing jest:

| Key (suggested) | Jest source |
|-----------------|-------------|
| `equals` | `@jest/expect-utils` |
| `utils` | `jest-matcher-utils` + iterable/subset equality |
| `customTesters` | registry on host |
| `dontThrow` | snapshot-style soft failure |
| `state` | `getState()` — test name, expand, etc. |

Core matchers should use `this.host.equals` etc. via typed helpers in the library pack, not import jest directly.

## MatcherAdapter (shared between Jest and Vitest)

```typescript
type MatcherAdapter = {
  wrapMatcher(
    semanticMatcher: SemanticMatcherFn,
    buildContext: (state: HostRunState) => SemanticMatcherContext,
  ): AdaptedMatcher;
};
```

Implement **once** in `packages/jest/src/adaptMatcher.ts`. Vitest re-exports if context shape matches (likely).

### Context mapping

| Semantic (core) | Jest MatcherContext |
|-----------------|---------------------|
| `isNot` | `isNot` |
| `promise` | `promise` (string in Jest) |
| `baseMatcher` | `baseMatcher` |
| `matchers` | `matchers` |
| `rawMatchers` | `rawMatchers` |
| `host.*` | `equals`, `utils`, `customTesters`, … |

When adapting **from** semantic **to** jest inside `runMatcher`, spread host fields onto context so existing prototype matchers ported to semantic style still work.

## installSemanticExpect

```typescript
function installSemanticExpect(
  nativeExpect: unknown,
  options?: {
    exposeOriginalAs?: 'jestExpect' | 'originalExpect' | false;
    global?: boolean;
    libraries?: MatcherLibrary;
  },
): { expect: SemanticExpect; originalExpect: unknown };
```

### Replacement strategy

1. `createJestHost(nativeExpect)` → `ExpectHost`
2. `createSemanticExpect({ host, libraries })` → patched expect
3. Optionally assign `globalThis.expect`
4. Expose `nativeExpect` as fallback global

Unknown matcher names should fall through to `nativeExpect` (adapter decision — improves compat with spies/snapshots).

## Fallback: delegate to native

Recommended v1 behavior when `resolveActiveMatcher` returns undefined:

```typescript
// delegate to nativeExpect(actual).matcherName(…)
```

This avoids reimplementing builtins in core and keeps spy matchers working.

## Registration API surface

Exposed on semantic expect (mirror prototype):

```typescript
expect.extendClass(matchers, Class);     // class-scoped
expect.extendGlobal(matchers);           // optional alias to host.extend
expect.getMatchers(Class?);              // introspection
```

Jest compatibility shim:

```typescript
expect.extend(matchers, Class?);  // routes to class or global registration
```

## Testing the host

| Test type | Location |
|-----------|----------|
| Registry / resolver / proxy | `packages/core/src/__tests__/` |
| Full assertion flow | `packages/jest/src/__tests__/` with real `expect` |
| Ported prototype cases | `classMatchers.test.ts` equivalent |

Core tests must not import `expect` package.

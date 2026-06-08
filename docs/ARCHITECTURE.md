# Architecture

## Layers

```
┌──────────────────────────────────────────────────────────────┐
│ Layer 4: Application tests                                  │
│   import expect from setup; expect(user).toHaveEmail(…)       │
└────────────────────────────┬─────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────┐
│ Layer 3: Runner adapters (@semantic-matchers/jest | vitest)   │
│   installSemanticExpect, createJestHost, adaptMatcher         │
│   type bridges: ClassMatchers / Assertion ← Semantic*         │
└────────────────────────────┬─────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────┐
│ Layer 2: Matcher libraries (MUI, domain — external packages)  │
│   defineMatcherLibrary, augment SemanticClassMatchers         │
└────────────────────────────┬─────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────┐
│ Layer 1: @semantic-matchers/core                              │
│   registry · resolver · proxy · SemanticMatcherFn · host API  │
└──────────────────────────────────────────────────────────────┘
```

## Core responsibilities

| Module | Responsibility |
|--------|----------------|
| `registry.ts` | `WeakMap<Class, matchers>`, global matchers, fallback stacks |
| `resolver.ts` | Prototype-chain walk; active matcher; fallback chain for `baseMatcher` |
| `proxy.ts` | `ExpectPath`, `not` / `resolves` / `rejects` chaining |
| `defineMatchers.ts` | `defineClassMatchers`, `defineMatcherLibrary` for packs |
| `host.ts` | `ExpectHost` contract — adapter implements |
| `createSemanticExpect.ts` | Composes registry + proxy + host.runMatcher |

## Adapter responsibilities

| Concern | Owner |
|---------|-------|
| Builtin matchers (`toEqual`, spies, …) | Host (`expect` / vitest) |
| Assertion errors, stack traces | Host |
| `equals`, `printReceived`, `matcherHint` | Host → injected via `ctx.host` |
| Class matcher registration | Core registry |
| Matcher dispatch / inheritance | Core resolver + proxy |
| Promise settlement → use **value's** constructor | Core + adapter `runMatcher` |
| Global `expect` replacement | Adapter `install*` |

## Data flow: `expect(button).toHaveLabel('Save')`

1. Adapter's `expect(actual)` calls `createExpectationProxy(handler)`.
2. Proxy receives property `toHaveLabel` → `handler(path, 'toHaveLabel')`.
3. Handler calls `resolveActiveMatcher(registry, name, actual.constructor)`.
4. Handler delegates to `host.runMatcher({ matcher, actual, path, … })`.
5. Adapter builds `SemanticMatcherContext` (maps host utils into `host` bag).
6. Adapter invokes semantic matcher; translates `{ pass, message }` to throw/pass.
7. On override, `baseMatcher` comes from `resolveFallbackChain` (core).

## Data flow: matcher library (no runner)

```typescript
// Published package — only core
import { defineClassMatchers } from '@semantic-matchers/core';

class MuiButton { /* … */ }

export const muiButtonMatchers = defineClassMatchers(MuiButton, {
  toHaveLabel(ctx, element, label) {
    const pass = /* … */;
    return { pass, message: () => `…` };
  },
});
```

No import of `expect`, `vitest`, or `@semantic-matchers/jest`.

## Type architecture

```
SemanticClassMatchers (core, empty, augmented by libraries)
        ▲
        │ extends (declaration merge)
        │
   ┌────┴────┐
   │         │
Jest         Vitest
ClassMatchers   Assertion
(register-types) (register-types)
```

**Single source of truth for matcher names and signatures:** `SemanticClassMatchers` augmentations in the library pack.

Adapters do **not** duplicate matcher signatures — they only bridge the interface name into the host module.

## What stays out of core

- `jest-matcher-utils`, `@jest/expect-utils`
- `JestAssertionError`, assertion count state (read from host if needed)
- Asymmetric matchers, snapshots, mock/spy matchers
- Vitest-only modifiers — adapter passes unknown segments to host proxy or extends `ExpectPath` later

## Extension points (future)

| Extension | Mechanism |
|-----------|-----------|
| New runner (e.g. Node test) | New adapter package implementing `ExpectHost` |
| New modifier (`soft`) | Extend adapter proxy OR delegate segment to host |
| Matcher pack | `defineMatcherLibrary` + `SemanticClassMatchers` augmentation |

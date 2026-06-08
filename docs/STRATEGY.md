# Strategy

## Problem

Test frameworks expose a **global** matcher model (`expect.extend`). Domain code is **typed** and **polymorphic**. The mismatch produces brittle helpers and assertions that compare the wrong fields.

The [jest-type-matchers-prototype](https://github.com/dvegap95/jest-type-matchers-prototype) proved the feature inside Jest. **semantic-matchers** productizes the idea as a library ecosystem.

## Goals

1. **Framework-agnostic matcher authoring** — libraries (MUI page objects, domain layers) depend only on `@semantic-matchers/core`.
2. **Thin runner adapters** — Jest and Vitest differ in installation and context wiring, not in matcher implementations.
3. **Composable overrides** — `baseMatcher` + fallback stacks when globals are replaced.
4. **Honest scope** — core owns class scope + dispatch; hosts own builtins, errors, spies, snapshots.

## Non-goals (v1)

- Replacing Jest/Vitest entirely
- Supporting every runner modifier in core types
- Auto-detecting the test framework at runtime in matcher libraries

## Canonical interface decision

### Question

Should matcher libraries define separate packs for `/jest` and `/vitest`?

### Answer: **No**

That creates a tree of redundant templates. Instead:

| Layer | Defines matchers? | Knows Jest/Vitest? |
|-------|-------------------|-------------------|
| `@semantic-matchers/core` | API + types (`SemanticMatcherFn`) | No |
| Your MUI / domain pack | **Yes — once** | No |
| `@semantic-matchers/jest` | No — adapts context | Jest only |
| `@semantic-matchers/vitest` | No — adapts context | Vitest only |

### Vitest-like vs Jest-like as canonical?

**Use the semantic (core) interface as canonical**, not Jest or Vitest literally.

Reasons:

- Jest and Vitest matcher **runtime** shapes are ~95% compatible today (both descend from the same `expect` design).
- Divergence is in **type augmentation targets** (`expect` vs `vitest` modules) and **host context fields**, not in your domain logic.
- Picking Vitest as canonical still leaks runner concepts (`Assertion`, `soft`) into libraries.
- Picking Jest leaks `MatcherContext` from `jest-matcher-utils`.

**Core `SemanticMatcherContext`** is the stable contract:

```typescript
(this, actual, ...expected) => { pass, message }
// plus: baseMatcher, matchers, rawMatchers, isNot, promise, host
```

Adapters map:

```
SemanticMatcherContext  ←→  Jest MatcherContext
SemanticMatcherContext  ←→  Vitest assertion context
```

One `adaptMatcher()` implementation can serve both if Vitest keeps jest-compatible internals (true today). Vitest adapter may only differ in **install** + **types entry point**.

### Runtime bifurcation?

**Avoid.** Do not:

```typescript
if (isVitest) { … } else { … }  // inside matcher library
```

Do:

```typescript
// mui-matchers — core only
export const muiMatchers = defineMatcherLibrary([…]);

// app test setup — pick ONE adapter
import { installSemanticExpect } from '@semantic-matchers/jest';
installSemanticExpect(jestExpect, { libraries: [muiMatchers] });
```

## MUI / Page Object use case

### Scenario

You ship `@your-scope/mui-semantic-matchers` with page object classes and matchers like `toHaveAccessibleName`, `toShowTooltip`, scoped to `MuiButton`, `MuiTextField`, etc. Consumers may use Jest or Vitest — unknown at library publish time.

### Recommended shape

```
@your-scope/mui-semantic-matchers
├── peer: @semantic-matchers/core
├── NO peer: jest, vitest, @testing-library/*
└── exports:
    ├── matchers.js      → defineMatcherLibrary([…])
    ├── page-objects/    → optional PO classes
    └── types.d.ts       → augments SemanticClassMatchers
```

Consumer setup (Jest):

```typescript
// setupFilesAfterEnv.ts
import jestExpect from 'expect';
import { installSemanticExpect } from '@semantic-matchers/jest';
import '@semantic-matchers/jest/register-types';
import { muiMatchers } from '@your-scope/mui-semantic-matchers';

installSemanticExpect(jestExpect, { libraries: [muiMatchers] });
```

Consumer setup (Vitest) — **same library**, different adapter import:

```typescript
import { expect as vitestExpect } from 'vitest';
import { installVitestSemanticExpect } from '@semantic-matchers/vitest';
import '@semantic-matchers/vitest/register-types';
import { muiMatchers } from '@your-scope/mui-semantic-matchers';

installVitestSemanticExpect(vitestExpect, { libraries: [muiMatchers] });
```

### Type flow

Libraries augment **core**, not Jest:

```typescript
// @your-scope/mui-semantic-matchers/types.d.ts
import '@semantic-matchers/core';

declare module '@semantic-matchers/core' {
  interface SemanticClassMatchers<R, T> {
    toHaveAccessibleName(expected: string): R;
  }
}
```

Adapter register-types re-exports merge into host:

- Jest: `ClassMatchers extends SemanticClassMatchers`
- Vitest: `Assertion extends SemanticClassMatchers`

Users get autocomplete in `expect(button).toHaveAccessibleName('Save')` regardless of runner — after one setup import.

## Phasing

| Phase | Deliverable |
|-------|-------------|
| **0** (this repo) | Docs, scaffold, host interface, core registry/resolver/proxy |
| **1** | Complete `createSemanticExpect` + Jest adapter; port prototype tests |
| **2** | Vitest adapter (reuse adapter util from Jest) |
| **3** | npm publish, example app |
| **4** | Example MUI matcher pack in `examples/mui-matchers` |

## Relationship to jest-type-matchers-prototype

| Repo | Role |
|------|------|
| `jest-type-matchers-prototype` | Historical Jest fork demo; upstream sync experiments |
| `semantic-matchers` | Production library; no Jest monorepo dependency |

Prototype remains portfolio evidence; this repo is what consumers install.

## Naming

- Monorepo: `semantic-matchers`
- Scope: `@semantic-matchers/*`
- Matcher packs: unscoped or `@your-scope/*` — not under `@semantic-matchers/` unless we officially maintain them (e.g. `@semantic-matchers/example-mui`)

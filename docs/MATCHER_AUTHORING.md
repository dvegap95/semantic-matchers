# Matcher authoring — define once, run anywhere

Guide for library authors (MUI page objects, domain entities, design-system tests).

## Rule

**Depend on `@semantic-matchers/core` only.** Never import `@semantic-matchers/jest` or `@semantic-matchers/vitest` from a shared library.

## Canonical matcher shape

```typescript
import type {SemanticMatcherFn} from '@semantic-matchers/core';

const toHaveLabel: SemanticMatcherFn<HTMLElement, [string]> = function (
  this,
  element,
  expected,
) {
  const actual = element.getAttribute('aria-label') ?? element.textContent;
  const pass = actual === expected;
  return {
    pass,
    message: () =>
      pass
        ? `expected element not to have label ${expected}`
        : `expected label ${expected}, got ${actual}`,
    actual,
    expected,
  };
};
```

### Using `baseMatcher`

When overriding a matcher registered on a parent class or a replaced global:

```typescript
toMatchIdentity(received, expected) {
  if (received.id === expected.id) {
    return { pass: true, message: () => 'ids match' };
  }
  return this.baseMatcher!(received, expected);
}
```

`baseMatcher` is wired by core + adapter — library code uses it the same on Jest and Vitest.

### Failure output (Vitest vs Jest)

Return optional `actual` and `expected` on `MatcherResult`. Vitest renders them as a separated diff automatically; Jest stores them on `JestAssertionError` but does not diff them yet.

```typescript
return {
  pass: false,
  message: () => 'expected label …',
  actual: receivedLabel,
  expected,
};
```

Use `@semantic-matchers/vitest` in Vitest projects when you want this output without duplicating matchers.

### Using host utilities (optional)

Prefer semantic checks in the library. When you need deep equality:

```typescript
const host = this.host as { equals?: (a: unknown, b: unknown) => boolean };
const pass = host.equals?.(received, expected) ?? Object.is(received, expected);
```

Document which `host` keys your pack requires. Adapters guarantee them on Jest/Vitest.

## Primary API — `expect.extend`

Same as the prototype. Register matchers in setup — no helper required:

```typescript
import { installSemanticExpect } from '@semantic-matchers/jest';
import expect from 'expect';
import { User, userMatchers } from './userMatchers';

const { expect: semanticExpect } = installSemanticExpect(expect, { global: true });

semanticExpect.extend(userMatchers, User);
semanticExpect.extend(otherMatchers, OtherClass);
semanticExpect.extend(globalMatchers); // no Class → global scope + fallback stack
```

Matcher functions use the familiar `(actual, …expected)` shape with `{ pass, message }`.

### Typing — class-keyed map (prototype style)

```typescript
import type { ExtendedMatchersForClass, MatchersObject } from '@semantic-matchers/core';

class User { email = ''; }

export const userMatchers: MatchersObject<User> = {
  toHaveEmail(actual, expected: string) { /* … */ },
};

declare module '@semantic-matchers/core' {
  // Global matchers (expect.extend(rawMatchers))
  interface SemanticMatchers<R> {
    toHaveColor(expected: string): R;
  }

  // Per-class matchers (expect.extend(matchers, User))
  interface SemanticClassMatcherMap<R> {
    User: ExtendedMatchersForClass<User, R, {
      toHaveEmail(expected: string): R;
    }>;
    Admin: ExtendedMatchersForClass<Admin, R, {
      toHaveRole(expected: string): R;
    }>;
  }
}
```

`SemanticClassMatcherMap` keys are **instance types** (`User`, `A`, `B`, …) — same as prototype `ClassMatchers<R> { A: …; B: … }`.  
Aliases: `ClassMatchers<R>`, `Matchers<R>`.

See [`examples/jest/classHierarchy.example.ts`](../examples/jest/classHierarchy.example.ts) for inheritance + fallback typing.

## defineClassMatchers (optional — matcher packs)

For npm packages that export a bundle:

```typescript
import { defineClassMatchers, defineMatcherLibrary } from '@semantic-matchers/core';

const buttonMatchers = defineClassMatchers(MuiButton, {
  toHaveLabel(_, btn, label) { /* … */ },
});

export const muiMatchers = defineMatcherLibrary([buttonMatchers]);
```

Consumers can still use `expect.extend(muiMatchers[0].matchers, muiMatchers[0].Class)` or pass `libraries: [muiMatchers]` to `installSemanticExpect`.

## Typing — augment core, not Jest

```typescript
// types.d.ts in your package
import '@semantic-matchers/core';

declare module '@semantic-matchers/core' {
  interface SemanticClassMatcherMap<R> {
    MuiButton: ExtendedMatchersForClass<MuiButton, R, {
      toHaveLabel(expected: string): R;
      toBeDisabled(): R;
    }>;
  }
}
```

Legacy: augment `SemanticClassMatchers<R, T>` directly (still supported).

Consumers import:

- `@semantic-matchers/jest/register-types` **or**
- `@semantic-matchers/vitest/register-types`

…in their test setup so augmentations flow into `expect(…)`.

## Why not duplicate jest/vitest matcher files?

| Approach | Problem |
|----------|---------|
| `matchers/jest.ts` + `matchers/vitest.ts` | Double maintenance; drift |
| Runtime `if (vitest)` in library | Couples library to runner |
| Vitest-as-canonical with jest translation | Still runner-centric; leaks modifiers |
| **Semantic canonical + adapter** | Single definition; adapters translate |

### "Translate Vitest to Jest" at the type level?

Types: both adapters extend the **same** `SemanticClassMatchers` — no translation needed.

Runtime: Jest and Vitest matcher invocation is already aligned (`function (this, actual, …args)` + `{pass, message}`). Adapter implements one `runMatcher`; Vitest package reuses Jest's if internals stay compatible.

If Vitest diverges in the future, only `packages/vitest/src/runMatcher.ts` changes — **not** your MUI pack.

## Consumer setup (not your package's job)

**Jest** `setupFilesAfterEnv.ts`:

```typescript
import jestExpect from 'expect';
import { installSemanticExpect } from '@semantic-matchers/jest';
import '@semantic-matchers/jest/register-types';
import '@your-scope/mui-semantic-matchers/types';
import { muiMatchers } from '@your-scope/mui-semantic-matchers';

installSemanticExpect(jestExpect, { libraries: [muiMatchers] });
```

**Vitest** `setup.ts`:

```typescript
import { expect as vitestExpect } from 'vitest';
import { installVitestSemanticExpect } from '@semantic-matchers/vitest';
import '@semantic-matchers/vitest/register-types';
import '@your-scope/mui-semantic-matchers/types';
import { muiMatchers } from '@your-scope/mui-semantic-matchers';

installVitestSemanticExpect(vitestExpect, { libraries: [muiMatchers] });
```

## Page objects + matchers together

Optional pattern:

```typescript
// page object IS the typed actual
class MuiButtonPage {
  constructor(readonly root: HTMLElement) {}
  click() { /* … */ }
}

defineClassMatchers(MuiButtonPage, {
  toShowLabel(_, page, label) {
    /* query from page.root */
  },
});
```

Tests: `expect(new MuiButtonPage(el)).toShowLabel('Save')` — class scope matches POO modeling.

## Checklist for a publishable matcher pack

- [ ] `peerDependencies`: `@semantic-matchers/core` only
- [ ] Matchers return `{ pass, message }` (sync or async)
- [ ] Types augment `@semantic-matchers/core` `SemanticClassMatchers`
- [ ] Export `defineMatcherLibrary` bundle
- [ ] README documents required setup import per runner (not duplicated matcher code)
- [ ] No `expect` / `vitest` imports in runtime code

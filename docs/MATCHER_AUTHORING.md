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

## defineClassMatchers

```typescript
import { defineClassMatchers, defineMatcherLibrary } from '@semantic-matchers/core';

class MuiButton {
  constructor(readonly root: HTMLElement) {}
}

const buttonMatchers = defineClassMatchers(MuiButton, {
  toHaveLabel(ctx, btn, label) { /* … */ },
  toBeDisabled(ctx, btn) { /* … */ },
});

export const muiMatchers = defineMatcherLibrary([buttonMatchers]);
```

## Typing — augment core, not Jest

```typescript
// types.d.ts in your package
import '@semantic-matchers/core';

declare module '@semantic-matchers/core' {
  interface SemanticClassMatchers<R, T> {
    toHaveLabel(expected: string): R;
    toBeDisabled(): R;
  }
}
```

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

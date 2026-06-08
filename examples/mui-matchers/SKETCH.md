# MUI matcher pack — sketch

Future `examples/mui-matchers` or `@your-scope/mui-semantic-matchers`.

```typescript
import {
  defineClassMatchers,
  defineMatcherLibrary,
} from '@semantic-matchers/core';

/** Page object as typed actual */
export class MuiButton {
  constructor(readonly root: HTMLElement) {}
}

export const muiMatchers = defineMatcherLibrary([
  defineClassMatchers(MuiButton, {
    toHaveAccessibleName(_ctx, button, name) {
      const label =
        button.root.getAttribute('aria-label') ?? button.root.textContent;
      const pass = label?.trim() === name;
      return {
        pass,
        message: () =>
          `expected accessible name ${name}, received ${label ?? '(empty)'}`,
      };
    },
  }),
]);
```

**package.json peers:** `@semantic-matchers/core` only.

**No** `jest` / `vitest` / `@semantic-matchers/jest` in dependencies.

Consumer picks adapter in test setup — see [MATCHER_AUTHORING.md](../../docs/MATCHER_AUTHORING.md).

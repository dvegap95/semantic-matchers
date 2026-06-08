# Vitest + semantic-matchers example

Same matcher definitions as Jest; Vitest host adds **actual / expected** on failures for built-in diffs.

## Setup

**`vitest.setup.ts`**

```typescript
import '@semantic-matchers/vitest/register-types';
import {installVitestSemanticExpect} from '@semantic-matchers/vitest';
import {userMatchers} from '../jest/userMatchers.js';

const {expect} = installVitestSemanticExpect();
expect.extend(userMatchers.matchers, userMatchers.Class);
```

**`vitest.config.ts`**

```typescript
import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./vitest.setup.ts'],
  },
});
```

## Test

See [`userMatchers.test.ts`](./userMatchers.test.ts).

```bash
yarn add -D @semantic-matchers/vitest vitest
yarn vitest
```

## Failure output (Vitest)

When a matcher returns `actual` and `expected`, Vitest prints a separated diff (same as native custom matchers):

```
AssertionError: expected user to have email alice@example.com

- Expected
+ Received

- alice@example.com
+ wrong@example.com
```

Return them from your matcher:

```typescript
return {
  pass: false,
  message: () => 'expected user to have email …',
  actual: actual.email,
  expected,
};
```

Types: augment `SemanticClassMatchers` once in your matcher pack; import `@semantic-matchers/vitest/register-types` in app setup.

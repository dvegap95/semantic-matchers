# Vitest examples

Same two registration styles as [Jest](../jest/README.md), sharing matcher definitions from `examples/jest/`.

| Approach | Setup |
|----------|--------|
| **`expect.extend`** | `expect.extend(userMatchers, User)` |
| **`defineClassMatchers`** | `installVitestSemanticExpect(undefined, { libraries: userMatcherPack })` |

---

## Setup — Approach A

**`vitest.setup.ts`**

```typescript
import '@semantic-matchers/vitest/register-types';
import {installVitestSemanticExpect} from '@semantic-matchers/vitest';
import {User, userMatchers} from '../jest/userMatchers.js';

const {expect} = installVitestSemanticExpect();
expect.extend(userMatchers, User);
```

**Test:** [`userMatchers.extend.test.ts`](./userMatchers.extend.test.ts)

---

## Setup — Approach B

**`vitest.setup.pack.ts`**

```typescript
import '@semantic-matchers/vitest/register-types';
import {installVitestSemanticExpect} from '@semantic-matchers/vitest';
import {userMatcherPack} from '../jest/userMatcherPack.js';

installVitestSemanticExpect(undefined, { libraries: userMatcherPack });
```

**Test:** [`userMatcherPack.test.ts`](./userMatcherPack.test.ts)

---

## Vitest config

```typescript
import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./vitest.setup.ts'],
  },
});
```

```bash
yarn add -D @semantic-matchers/vitest vitest
yarn vitest
```

## Failure output (Vitest)

When a matcher returns `actual` and `expected`, Vitest prints a separated diff:

```
AssertionError: expected user to have email alice@example.com

- Expected
+ Received

- alice@example.com
+ wrong@example.com
```

Types: augment `SemanticClassMatcherMap` once (see `examples/jest/userMatchers.ts`); import `@semantic-matchers/vitest/register-types` in app setup.

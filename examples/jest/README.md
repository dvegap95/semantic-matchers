# Jest + semantic-matchers example

Minimal setup for class-scoped matchers with the standalone `expect` package (same API as Jest).

## Setup

**`jest.setup.ts`**

```typescript
import '@semantic-matchers/jest/register-types';
import expect from 'expect';
import {installSemanticExpect} from '@semantic-matchers/jest';
import {userMatchers} from './userMatchers.js';

const {expect: semanticExpect} = installSemanticExpect(expect, {
  global: true,
  exposeOriginalAs: 'jestExpect',
});

semanticExpect.extend(userMatchers.matchers, userMatchers.Class);
```

**`jest.config.js`**

```javascript
export default {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
```

## Matcher pack (framework-agnostic)

See [`userMatchers.ts`](./userMatchers.ts) — defined with `@semantic-matchers/core` only.

## Test

See [`userMatchers.test.ts`](./userMatchers.test.ts).

```bash
yarn add -D @semantic-matchers/jest expect jest ts-jest
yarn jest
```

## Failure output

Jest shows the matcher `message()` string. For richer diffs, return optional `actual` / `expected` from matchers — Vitest surfaces them automatically via `@semantic-matchers/vitest`.

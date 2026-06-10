# Jest examples

Two ways to register the same `User` / `toHaveEmail` matcher — use either or both.

| File | Approach | Register in setup |
|------|----------|-------------------|
| [`userMatchers.ts`](./userMatchers.ts) | **`expect.extend`** (prototype style) | `expect.extend(userMatchers, User)` |
| [`userMatcherPack.ts`](./userMatcherPack.ts) | **`defineClassMatchers`** (matcher pack) | `installSemanticExpect(expect, { libraries: userMatcherPack })` or `expect.extend(bundle.matchers, bundle.Class)` |

Types are declared once in `userMatchers.ts` via `SemanticClassMatcherMap`.

See also [`classHierarchy.example.ts`](./classHierarchy.example.ts) for multi-class inheritance + global matchers.

---

## Setup — Approach A (`expect.extend`)

**`jest.setup.ts`**

```typescript
import '@semantic-matchers/jest/register-types';
import expect from 'expect';
import {installSemanticExpect} from '@semantic-matchers/jest';
import {User, userMatchers} from './userMatchers.js';

const {expect: semanticExpect} = installSemanticExpect(expect, {
  global: true,
  exposeOriginalAs: 'jestExpect',
});

semanticExpect.extend(userMatchers, User);
semanticExpect.extend(otherMatchers, OtherClass);
semanticExpect.extend(globalMatchers); // no Class → global scope
```

**Test:** [`userMatchers.extend.test.ts`](./userMatchers.extend.test.ts)

---

## Setup — Approach B (`defineClassMatchers`)

**`jest.setup.pack.ts`**

```typescript
import '@semantic-matchers/jest/register-types';
import expect from 'expect';
import {installSemanticExpect} from '@semantic-matchers/jest';
import {userMatcherPack} from './userMatcherPack.js';

installSemanticExpect(expect, {
  global: true,
  libraries: userMatcherPack,
});
```

Or register manually:

```typescript
import {userMatcherBundle} from './userMatcherPack.js';

semanticExpect.extend(userMatcherBundle.matchers, userMatcherBundle.Class);
```

**Test:** [`userMatcherPack.test.ts`](./userMatcherPack.test.ts)

---

## Jest config

```javascript
export default {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // or jest.setup.pack.ts
};
```

```bash
yarn add -D @semantic-matchers/jest expect jest ts-jest
yarn jest
```

## Failure output

Return optional `actual` / `expected` from matchers for structured diffs (Vitest surfaces them automatically).

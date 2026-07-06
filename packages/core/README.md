# @semantic-matchers/core

Framework-agnostic **class-scoped custom matchers** with prototype-chain resolution and composable `baseMatcher`.

Use this package when you author matcher libraries that should work with any test runner. Runner wiring lives in `@semantic-matchers/jest` or `@semantic-matchers/vitest`.

## Install

```bash
npm install @semantic-matchers/core
# or
yarn add @semantic-matchers/core
```

## Quick start

```typescript
import {defineClassMatchers, defineMatchers} from '@semantic-matchers/core';

export const userMatchers = defineClassMatchers(User, {
  toHaveEmail(received, email: string) {
    const pass = received.email === email;
    return {
      pass,
      message: () =>
        pass
          ? `expected user not to have email ${email}`
          : `expected user to have email ${email}, got ${received.email}`,
    };
  },
});
```

## API highlights

- `defineMatchers` / `defineClassMatchers` — declare matchers with TypeScript inference
- `createSemanticExpect` — build a runner-agnostic expect proxy (used by adapters)
- `MatcherLibrary` — bulk-register matcher packs by class

## Docs

Full documentation: [github.com/dvegap95/semantic-matchers](https://github.com/dvegap95/semantic-matchers)

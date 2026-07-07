# @semantic-matchers/core

**Framework-agnostic class-scoped matchers** for expect customization. Define type-specific, instance-based assertions once — no Jest or Vitest imports in your matcher library.

## Problem this solves

- **Matcher packs per class** — `User`, `Admin`, page objects, component wrappers
- **Type-specific / class-based matchers** without runner lock-in
- **Prototype-chain dispatch** — subclasses inherit and override matchers
- **`baseMatcher` composition** — extend assertions without global `expect.extend` conflicts
- Ship a **matcher library** consumers wire with `@semantic-matchers/jest` or `@semantic-matchers/vitest`

## Install

```bash
npm install @semantic-matchers/core
# or
yarn add @semantic-matchers/core
```

## Quick start

```typescript
import {defineClassMatchers} from '@semantic-matchers/core';

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

- `defineMatchers` / `defineClassMatchers` — type-inferred matcher definitions
- `createSemanticExpect` — runner-agnostic expect proxy (used by adapters)
- `MatcherLibrary` — bulk-register matcher packs by class

## Docs

Full documentation: [github.com/dvegap95/semantic-matchers](https://github.com/dvegap95/semantic-matchers)

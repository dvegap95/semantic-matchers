# @semantic-matchers/vitest

**Customize expect with class-scoped matchers for Vitest.** Same type-specific, class-based dispatch as the Jest adapter — chainable modifiers plus native expected/received diffs.

## Problem this solves

- **Vitest custom matchers per class** / **type-specific matchers**
- **Expect customization** for domain objects and page objects
- **Chainable assertions** on instances — `.not`, `.resolves`, `.rejects`
- **Polymorphic matchers** without manual type switching in `expect.extend`
- Richer failure output when matchers return `actual` / `expected` (Vitest diff rendering)

## Install

```bash
npm install -D @semantic-matchers/vitest vitest
# or
yarn add -D @semantic-matchers/vitest vitest
```

## Setup

```typescript
import '@semantic-matchers/vitest/register-types';
import {installVitestSemanticExpect} from '@semantic-matchers/vitest';

installVitestSemanticExpect();
```

## Usage

```typescript
expect(user).toHaveEmail('alice@example.com');
await expect(Promise.resolve(user)).resolves.toHaveEmail('alice@example.com');
```

## Docs

Full documentation and examples: [github.com/dvegap95/semantic-matchers](https://github.com/dvegap95/semantic-matchers)

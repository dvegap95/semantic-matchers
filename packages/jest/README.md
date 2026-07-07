# @semantic-matchers/jest

**Customize expect with class-scoped matchers for Jest.** Type-specific assertion logic per class, resolved on the prototype chain — chainable with `.not`, `.resolves`, and `.rejects`.

## Problem this solves

You might be looking for:

- **Class-based / class-scoped matchers** — different `toX()` behavior per domain type
- **Type-specific custom matchers** without `instanceof` branches in every matcher
- **Expect customization** beyond global `expect.extend`
- **Chainable custom assertions** (`.not`, `.resolves`, `.rejects`) on class instances
- **Page-object or domain matchers** — `expect(user).toHaveEmail()`, `expect(button).toBeVisible()`
- **Polymorphic / dynamic dispatch** for Jest assertions

Jest matchers are global by default. This adapter scopes them to classes with full TypeScript inference.

## Install

```bash
npm install -D @semantic-matchers/jest expect
# or
yarn add -D @semantic-matchers/jest expect
```

## Setup

**`jest.setup.ts`**

```typescript
import '@semantic-matchers/jest/register-types';
import expect from 'expect';
import {installSemanticExpect} from '@semantic-matchers/jest';

installSemanticExpect(expect, {
  global: true,
  exposeOriginalAs: 'jestExpect',
});
```

## Usage

```typescript
semanticExpect.extend(userMatchers, User);

const user = new User();
user.email = 'alice@example.com';

expect(user).toHaveEmail('alice@example.com');
await expect(Promise.resolve(user)).resolves.toHaveEmail('alice@example.com');
expect(user).not.toHaveEmail('bob@example.com');
```

## Docs

Full documentation and examples: [github.com/dvegap95/semantic-matchers](https://github.com/dvegap95/semantic-matchers)

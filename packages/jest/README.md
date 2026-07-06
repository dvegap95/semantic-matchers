# @semantic-matchers/jest

Jest plugin for **semantic class-scoped matchers** — install on `expect` with full TypeScript inference.

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
```

## Docs

Full documentation and examples: [github.com/dvegap95/semantic-matchers](https://github.com/dvegap95/semantic-matchers)

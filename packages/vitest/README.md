# @semantic-matchers/vitest

Vitest plugin for **semantic class-scoped matchers** — same API as Jest with Vitest-native failure diffs.

Matchers can return optional `actual` and `expected` fields; the Vitest adapter throws `VitestExtendError` so Vitest renders separated expected/received output.

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

Same `defineClassMatchers` / `expect.extend` API as Jest:

```typescript
expect(user).toHaveEmail('alice@example.com');
```

## Docs

Full documentation and examples: [github.com/dvegap95/semantic-matchers](https://github.com/dvegap95/semantic-matchers)

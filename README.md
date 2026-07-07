# semantic-matchers

[![CI](https://github.com/dvegap95/semantic-matchers/actions/workflows/ci.yml/badge.svg)](https://github.com/dvegap95/semantic-matchers/actions/workflows/ci.yml)
[![npm core](https://img.shields.io/npm/v/@semantic-matchers/core?label=%40semantic-matchers%2Fcore)](https://www.npmjs.com/package/@semantic-matchers/core)
[![npm jest](https://img.shields.io/npm/v/@semantic-matchers/jest?label=%40semantic-matchers%2Fjest)](https://www.npmjs.com/package/@semantic-matchers/jest)
[![npm vitest](https://img.shields.io/npm/v/@semantic-matchers/vitest?label=%40semantic-matchers%2Fvitest)](https://www.npmjs.com/package/@semantic-matchers/vitest)
[![License: MIT](https://img.shields.io/github/license/dvegap95/semantic-matchers)](LICENSE)

**Class-scoped, type-specific custom matchers for Jest and Vitest** — customize `expect` with per-class assertion logic, chainable via `.not`, `.resolves`, and `.rejects`.

## Why use this?

People find this problem under lots of names. You might be searching for:

- *"Jest custom matchers per class"* / *"class-based matchers"*
- *"Type-specific matchers in Jest"* / *"matchers based on instance type"*
- *"How to customize expect in Jest"* / *"extend expect for domain objects"*
- *"Polymorphic matchers in Jest"* / *"dynamic dispatch for custom assertions"*
- *"Chainable custom matchers"* with `.not` / `.resolves` / `.rejects`
- *"Page object matchers"* / *"assertions for class instances"*
- *"Tired of `instanceof` / `typeof` checks inside `expect.extend`?"*

Jest's `expect.extend` is **global**: one matcher name → one function for every value. Domain models (`User`, `Admin`, page objects, UI components) need **different assertion logic per class** — but you shouldn't copy-paste matchers or stuff type switches into every matcher body.

**semantic-matchers** adds **class-scoped dispatch** on top of expect:

- Register matchers on a **class** — `User`, `MuiButton`, your page-object base, etc.
- `expect(instance)` picks the right matcher set via the **prototype chain** (subclasses inherit and override)
- **Chainable** like built-in expect: `.not`, `.resolves`, `.rejects` keep working
- **`baseMatcher`** — wrap or override a matcher without breaking globals
- Author matcher packs once on `@semantic-matchers/core`; wire **Jest** or **Vitest** with a thin adapter

Also called: polymorphic matchers, type-aware matchers, multiple dispatch for assertions, class-scoped `expect.extend`.

Matcher libraries depend only on **`@semantic-matchers/core`**. Test runners are wired through `@semantic-matchers/jest` or `@semantic-matchers/vitest`.

Extracted from the [jest-type-matchers-prototype](https://github.com/dvegap95/jest-type-matchers-prototype) experiment.

## Install

Published on [npm](https://www.npmjs.com/search?q=%40semantic-matchers) as **@semantic-matchers/*** (see table below).

```bash
# Jest
yarn add -D @semantic-matchers/jest expect

# Vitest
yarn add -D @semantic-matchers/vitest vitest

# Matcher pack (no runner)
yarn add @semantic-matchers/core
```

## Quick start (Jest)

**`jest.setup.ts`**

```typescript
import '@semantic-matchers/jest/register-types';
import expect from 'expect';
import {installSemanticExpect} from '@semantic-matchers/jest';

installSemanticExpect(expect, {
  global: true,
  exposeOriginalAs: 'jestExpect', // optional escape hatch
});
```

**Register class matchers** — either approach:

```typescript
// A — expect.extend (app tests, prototype style)
semanticExpect.extend(userMatchers, User);

// B — matcher pack (libraries, bulk install)
installSemanticExpect(expect, { libraries: userMatcherPack });
```

See [`examples/jest/`](./examples/jest/) for both patterns side by side.

**Test**

```typescript
const user = new User();
user.email = 'alice@example.com';

expect(user).toHaveEmail('alice@example.com');
await expect(Promise.resolve(user)).resolves.toHaveEmail('alice@example.com');
```

## Quick start (Vitest)

```typescript
import '@semantic-matchers/vitest/register-types';
import {installVitestSemanticExpect} from '@semantic-matchers/vitest';

installVitestSemanticExpect(); // uses vitest's built-in expect
```

Same `defineClassMatchers` / `expect.extend` API as Jest.

**Prefer Vitest for failure output:** return optional `actual` and `expected` from matchers — the Vitest adapter throws `VitestExtendError` with those fields so Vitest renders separated diffs (message + expected/received). Jest gets the same fields on `JestAssertionError` but does not diff them today.

See [examples/vitest](./examples/vitest) and [examples/jest](./examples/jest).

## Packages

| Package | Role |
|---------|------|
| [`@semantic-matchers/core`](https://www.npmjs.com/package/@semantic-matchers/core) | Registry, resolution, proxy, canonical types |
| [`@semantic-matchers/jest`](https://www.npmjs.com/package/@semantic-matchers/jest) | `installSemanticExpect`, Jest host adapter |
| [`@semantic-matchers/vitest`](https://www.npmjs.com/package/@semantic-matchers/vitest) | `installVitestSemanticExpect`, Vitest host with actual/expected diffs |
| `@semantic-matchers/conformance` | Shared A/B/C/D hierarchy tests (dev-only) |

## Publishing

This repo uses [Changesets](https://github.com/changesets/changesets). See **[docs/PUBLISHING.md](./docs/PUBLISHING.md)** for a step-by-step npm guide (login, versioning, first release, CI).

```bash
yarn changeset          # describe changes
yarn version-packages   # bump versions + changelogs
yarn release            # build + npm publish
```

## Development

```bash
yarn install
yarn test:all      # conformance + unit tests from repo root
yarn test:watch    # watch mode (Vitest extension uses the same config)
yarn build
```

**Editor test explorer:** install the [Vitest extension](https://marketplace.visualstudio.com/items?itemName=vitest.explorer), reload the window, open the Testing sidebar. See [docs/TESTING.md](./docs/TESTING.md) if no tests appear.

## Docs

| Doc | Purpose |
|-----|---------|
| [docs/PUBLISHING.md](./docs/PUBLISHING.md) | **npm publish walkthrough** |
| [docs/STRATEGY.md](./docs/STRATEGY.md) | Goals and phasing |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Layer boundaries |
| [docs/HOST_INTERFACE.md](./docs/HOST_INTERFACE.md) | Adapter contract |
| [docs/MATCHER_AUTHORING.md](./docs/MATCHER_AUTHORING.md) | Define matchers once |
| [docs/IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md) | Implementation checklist |
| [AGENTS.md](./AGENTS.md) | Agent entry point |

## License

MIT

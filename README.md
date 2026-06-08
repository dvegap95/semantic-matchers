# semantic-matchers

**Class-scoped custom matchers** with prototype-chain resolution and composable `baseMatcher` — extracted from the [jest-type-matchers-prototype](https://github.com/dvegap95/jest-type-matchers-prototype) experiment.

This repo is **framework-agnostic at the core**: matcher libraries (domain entities, MUI page objects, etc.) depend only on `@semantic-matchers/core`. Test runners are wired through **thin adapters** (`@semantic-matchers/jest`, `@semantic-matchers/vitest`).

## Why

Global `expect.extend` registers matchers for every value. Domain-rich tests need assertions aligned with **type semantics** — identity vs email vs display representation — without duplicating matcher logic per test framework.

## Packages

| Package | Role | Depends on |
|---------|------|------------|
| `@semantic-matchers/core` | Registry, resolution, proxy dispatch, canonical matcher types | nothing |
| `@semantic-matchers/jest` | Jest `expect` host adapter + type bridge | `core`, `expect` (peer) |
| `@semantic-matchers/vitest` | Vitest adapter (same matchers, different host) | `core`, `vitest` (peer) |

**Matcher packs** (future, separate repos or `examples/`):

| Example | Role |
|---------|------|
| `@semantic-matchers/mui` | Page-object matchers for MUI components — **core only** |

## Quick mental model

```
┌─────────────────────────────────────────────────────────┐
│  Your library (MUI page objects, domain entities)        │
│  defineClassMatchers(Button, { toHaveLabel … })          │
│  depends on: @semantic-matchers/core ONLY                │
└──────────────────────────┬──────────────────────────────┘
                           │ MatcherLibrary
                           ▼
┌─────────────────────────────────────────────────────────┐
│  @semantic-matchers/jest  OR  @semantic-matchers/vitest  │
│  installSemanticExpect({ libraries: [muiMatchers] })     │
│  translates host context ↔ semantic context (once)       │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
                    Jest / Vitest test run
```

**You do not write separate matchers for Jest and Vitest.** Adapters translate; libraries define once.

## Status

**Scaffold / planning phase.** Core has working registry + resolver + proxy stubs; adapters throw until implemented.

| Doc | Purpose |
|-----|---------|
| [docs/STRATEGY.md](./docs/STRATEGY.md) | Product strategy, phasing, MUI use case |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Layer boundaries and data flow |
| [docs/HOST_INTERFACE.md](./docs/HOST_INTERFACE.md) | Contract for Jest/Vitest adapters |
| [docs/MATCHER_AUTHORING.md](./docs/MATCHER_AUTHORING.md) | **Canonical interface** — define once, run anywhere |
| [docs/IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md) | Step-by-step for implementation agent |
| [AGENTS.md](./AGENTS.md) | Cursor agent entry point |

## Prototype reference

Implementation source of truth for behavior (not structure):

- Repo: `../jest-type-matchers-prototype` (local) or [dvegap95/jest-type-matchers-prototype](https://github.com/dvegap95/jest-type-matchers-prototype)
- Key files: `packages/expect/src/matcherResolvers.ts`, `jestMatchersObject.ts`, `index.ts`, `typeUtils.ts`

## Development

```bash
yarn install
yarn workspace @semantic-matchers/core test
yarn build
```

## License

MIT

# Agent guide — semantic-matchers

## Mission

Implement class-scoped matchers as a **standalone npm monorepo**, extracted from `jest-type-matchers-prototype`, with a **framework-agnostic core** and thin Jest/Vitest adapters.

## Read first

1. [docs/STRATEGY.md](./docs/STRATEGY.md) — goals and phasing
2. [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — layers
3. [docs/HOST_INTERFACE.md](./docs/HOST_INTERFACE.md) — adapter contract
4. [docs/IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md) — ordered tasks

## Prototype reference (behavior)

Clone or use sibling path:

```
C:\Users\dvega\Documents\work\programming\jest\jest-type-matchers-prototype
```

Port **behavior** from:

| Prototype file | Target |
|----------------|--------|
| `packages/expect/src/matcherResolvers.ts` | `packages/core/src/resolver.ts`, `proxy.ts` |
| `packages/expect/src/jestMatchersObject.ts` (class + fallback parts) | `packages/core/src/registry.ts` |
| `packages/expect/src/index.ts` (dispatch, promises, baseMatcher) | `packages/jest/src/` host + `createSemanticExpect.ts` |
| `packages/expect/src/typeUtils.ts` | `packages/core/src/types/` (inference) |
| `packages/expect/src/__tests__/classMatchers.test.ts` | `packages/jest/src/__tests__/` integration |

**Do not** port Jest builtins, spies, snapshots, or asymmetric matchers into core.

## Non-goals (v1)

- Reimplementing `expect` builtins
- Unified types for every Vitest-only modifier (`soft`, `poll`)
- Runtime framework auto-detection
- Chai / Node test runner support

## Success criteria

1. `@semantic-matchers/core` tests pass with **zero** jest/vitest imports
2. `@semantic-matchers/jest` passes ported `classMatchers` integration tests
3. A `defineMatcherLibrary` pack can be registered without importing jest/vitest
4. `installSemanticExpect({ global: true, exposeOriginalAs: 'jestExpect' })` works in Jest setup

## Commands

```bash
yarn install
yarn workspace @semantic-matchers/core test
yarn workspace @semantic-matchers/jest test
yarn build
```

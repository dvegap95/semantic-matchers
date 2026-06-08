# Implementation plan

Ordered tasks for the implementation agent. Check off as completed.

## Phase 1 — Core (framework-free)

### 1.1 Registry + resolver (mostly done)

- [x] `createMatcherRegistry`, `registerClassMatchers`, fallback stacks
- [x] Prototype-chain resolution
- [x] `resolveFallbackChain` for `baseMatcher`
- [ ] Port `resolveEncapsulatedFallbackMatcherForClass` from prototype `matcherResolvers.ts`
- [ ] Unit tests: inheritance override, global fallback stack, null/primitive actual

### 1.2 Proxy (mostly done)

- [x] `ExpectPath`, `createExpectationProxy`
- [ ] Tests: `.not`, `.resolves`, `.rejects` chaining order

### 1.3 createSemanticExpect (stub → complete)

- [ ] Wire `makeResolve` / `makeReject` equivalent via host (or move promise logic to core with host error formatter callback)
- [ ] `extend` / `extendClass` / `getMatchers` API
- [ ] Delegate unknown matchers to `host.nativeExpect`

Reference: `jest-type-matchers-prototype/packages/expect/src/index.ts`

### 1.4 Type inference

- [ ] Port `typeUtils.ts` → `packages/core/src/types/inference.ts`
- [ ] `ExpectationFor<T>` equivalent on semantic expect return type
- [ ] `__typetests__` with `tstyche` or tsc assert

## Phase 2 — Jest adapter

### 2.1 adaptMatcher + createJestHost

- [ ] `packages/jest/src/adaptMatcher.ts` — map semantic ↔ jest context
- [ ] `packages/jest/src/createJestHost.ts` — implements `ExpectHost`
- [ ] `runMatcher` with `JestAssertionError`, assertion counts, `dontThrow`
- [ ] Promise settlement uses result/error constructor (prototype bugfix)

### 2.2 installSemanticExpect

- [ ] Replace stub in `packages/jest/src/index.ts`
- [ ] `expect.extend(matchers, Class?)` shim
- [ ] `register-types` verified with consumer tsconfig

### 2.3 Integration tests

- [ ] Port `classMatchers.test.ts` from prototype (18 cases)
- [ ] Port snapshot-dependent cases or simplify messages
- [ ] `extend.test.ts` parity for class + global override + baseMatcher

## Phase 3 — Vitest adapter

- [ ] `createVitestHost` — likely thin wrapper over jest host
- [ ] `installVitestSemanticExpect`
- [ ] `register-types` for `vitest` module
- [ ] Same integration tests running under vitest config

## Phase 4 — Polish

- [ ] Root `README` usage section with real API
- [ ] `examples/mui-matchers` minimal pack
- [ ] `examples/jest-app` + `examples/vitest-app`
- [ ] Changesets / npm publish config
- [ ] Cross-link from `jest-type-matchers-prototype` README

## Extraction checklist (prototype → core)

| Behavior | Prototype location | Status |
|----------|-------------------|--------|
| WeakMap class registry | `jestMatchersObject.ts` | Done in core |
| Global fallback on extend | `jestMatchersObject.ts` | Done in core |
| Prototype chain resolve | `matcherResolvers.ts` | Done in core |
| baseMatcher chain | `matcherResolvers.ts` | Partial |
| ExpectPath proxy | `matcherResolvers.ts` | Done in core |
| Promise constructor fix | `index.ts` | Pending |
| ExpectationFor types | `types.ts` + `typeUtils.ts` | Pending |

## Commands

```bash
cd C:\Users\dvega\Documents\work\programming\jest\semantic-matchers
yarn install
yarn workspace @semantic-matchers/core test
yarn workspace @semantic-matchers/jest test
yarn build
```

## Prototype test command (reference)

```bash
cd ..\jest-type-matchers-prototype
yarn jest packages/expect/src/__tests__/classMatchers.test.ts
```

New Jest adapter tests should match this behavior.

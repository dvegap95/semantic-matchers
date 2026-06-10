# Examples

Runnable patterns for registering class-scoped matchers. Both approaches use the **same types** (`SemanticClassMatcherMap`) and **same runtime behavior** — only the registration style differs.

| Directory | What it shows |
|-----------|----------------|
| [`jest/`](./jest/) | Jest setup — **`expect.extend`** and **`defineClassMatchers`** |
| [`jest/classHierarchy.example.ts`](./jest/classHierarchy.example.ts) | Multi-class inheritance (A → B → C) + global matchers |
| [`vitest/`](./vitest/) | Same matchers with Vitest setup (both approaches) |
| [`mui-matchers/`](./mui-matchers/) | Sketch for a publishable matcher pack |

## Quick comparison

```typescript
// A — prototype style (app tests, one-off matchers)
expect.extend(userMatchers, User);

// B — matcher pack (libraries, bulk install, npm packages)
installSemanticExpect(nativeExpect, { libraries: userMatcherPack });
// or: expect.extend(bundle.matchers, bundle.Class);
```

See [docs/MATCHER_AUTHORING.md](../docs/MATCHER_AUTHORING.md) for the full authoring guide.

# Running tests

## Terminal (all packages)

```bash
yarn test          # each workspace package, sequentially
yarn test:all      # all 37 tests via root Vitest projects config
yarn test:watch    # watch mode from repo root
```

Single package:

```bash
yarn workspace @semantic-matchers/core test
yarn workspace @semantic-matchers/jest test
yarn workspace @semantic-matchers/vitest test
```

## Cursor / VS Code test explorer

This repo uses **Vitest** (not Jest) for its own unit tests. The editor integration is the **[Vitest](https://marketplace.visualstudio.com/items?itemName=vitest.explorer)** extension (`vitest.explorer`).

### Why the extension found zero tests before

1. **Monorepo layout** — tests live under `packages/*/src/__tests__/`, not at the repo root. The extension only scans the workspace root unless a **root `vitest.config.ts`** defines `test.projects`.
2. **Yarn PnP** — dependencies are not in `node_modules/`. The editor needs Yarn SDK settings (`.vscode/settings.json` + `.yarn/sdks`) and `NODE_OPTIONS` to load `.pnp.cjs`.

### Setup checklist

1. Install the **Vitest** extension (Cursor should prompt via `.vscode/extensions.json`).
2. **Reload the window** after pulling: `Ctrl+Shift+P` → “Developer: Reload Window”.
3. Open the **Testing** side bar (beaker icon). You should see three projects:
   - `@semantic-matchers/core` (21 tests)
   - `@semantic-matchers/jest` (12 tests)
   - `@semantic-matchers/vitest` (4 tests)
4. If prompted, select **Use Workspace Version** for TypeScript (uses `.yarn/sdks/typescript`).

### If tests still don’t appear

| Symptom | Fix |
|---------|-----|
| Empty Testing panel | Confirm `vitest.config.ts` exists at repo root; run `yarn test:all` in terminal first |
| “Cannot find module” in Vitest output | Reload window; ensure `.pnp.cjs` exists (`yarn install`) |
| Extension disabled | Check `vitest.enable` is true in `.vscode/settings.json` |
| Wrong working directory | Open the **repo root** folder in Cursor, not a parent or single package |

### Regenerate Yarn editor SDKs

After adding dependencies:

```bash
yarn dlx @yarnpkg/sdks vscode
```

Then reload the window.

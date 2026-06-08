# Publishing to npm

This monorepo publishes three packages under the **`@semantic-matchers`** scope:

| Package | What consumers install |
|---------|------------------------|
| `@semantic-matchers/core` | Matcher libraries (no test runner) |
| `@semantic-matchers/jest` | Jest apps |
| `@semantic-matchers/vitest` | Vitest apps |

All three versions are **kept in sync** via [Changesets](https://github.com/changesets/changesets) (`fixed` group in `.changeset/config.json`).

---

## One-time setup

### 1. Create an npm account

1. Go to [https://www.npmjs.com/signup](https://www.npmjs.com/signup)
2. Verify your email

### 2. Log in on your machine

```bash
npm login
```

Enter username, password, and OTP if you use 2FA. Check with:

```bash
npm whoami
```

### 3. Scoped package access

Packages are named `@semantic-matchers/...`. Scoped packages are **private by default** on free accounts unless you set public access.

This repo already sets in each `package.json`:

```json
"publishConfig": {
  "access": "public"
}
```

You do **not** need a paid npm org for public scoped packages.

### 4. (Optional) Create an npm organization

If you want the scope to appear as an org on npm:

1. [https://www.npmjs.com/org/create](https://www.npmjs.com/org/create)
2. Name it `semantic-matchers` (must match the scope in package names)

If your npm username owns the scope, publishing still works without a formal org.

---

## How versioning works (Changesets)

**You do not hand-edit versions** in `package.json` for releases. Instead:

1. **`yarn changeset`** — describe your change; Changesets writes a small markdown file in `.changeset/`
2. **`yarn version-packages`** — bumps `package.json` versions, updates `CHANGELOG.md` files, deletes consumed changesets
3. **`yarn release`** — builds and runs `npm publish` for changed packages

### Typical release flow (local)

```bash
# 1. After merging feature PRs, add a changeset on main
yarn changeset
# Choose: patch | minor | major
# Select all @semantic-matchers/* packages (they're linked)
# Write a short summary, e.g. "Add Vitest adapter and npm publish tooling"

git add .changeset
git commit -m "chore: add changeset"
git push

# 2. Version bump (often a separate PR or direct on main)
yarn version-packages
git add .
git commit -m "chore: version packages"
git push

# 3. Publish
yarn release
```

`yarn release` runs `yarn build` first, then publishes only packages whose versions are not yet on npm.

### Semver cheat sheet

| Bump | When |
|------|------|
| **patch** | Bug fixes, docs, internal refactors |
| **minor** | New features, backward compatible |
| **major** | Breaking API changes |

First public release is usually **`0.1.0`** (minor from `0.0.0`) or **`1.0.0`** when you consider the API stable.

---

## First publish checklist

Before `yarn release`:

- [ ] All tests pass: `yarn test`
- [ ] Build succeeds: `yarn build`
- [ ] `npm whoami` works
- [ ] At least one changeset exists (or run `yarn changeset` first)
- [ ] Versions bumped via `yarn version-packages`
- [ ] Git tag / GitHub release (optional but recommended)

### Dry run (see what would ship)

```bash
yarn build
yarn workspace @semantic-matchers/core npm publish --dry-run
yarn workspace @semantic-matchers/jest npm publish --dry-run
yarn workspace @semantic-matchers/vitest npm publish --dry-run
```

This repo sets `npmPublishRegistry` to `https://registry.npmjs.org` in `.yarnrc.yml` (required — Yarn defaults to its own registry otherwise).

---

## CI publishing (GitHub Actions)

The workflow in `.github/workflows/release.yml` can:

1. Run tests on every push/PR
2. On push to `main`, use [changesets/action](https://github.com/changesets/action) to open a "Version packages" PR or publish

To enable automated publish:

1. Create an npm **Access Token** (type: **Automation**) at [npmjs.com/settings/~/tokens](https://www.npmjs.com/settings/~/tokens)
2. Add it as a GitHub repo secret: **Settings → Secrets → Actions → `NPM_TOKEN`**

---

## What consumers install

```bash
# Jest project
npm install -D @semantic-matchers/jest expect

# Vitest project
npm install -D @semantic-matchers/vitest vitest

# Matcher library (no runner)
npm install @semantic-matchers/core
```

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `402 Payment Required` / private scope | Add `"publishConfig": { "access": "public" }` (already in this repo) |
| `403 Forbidden` | Wrong npm user, or scope owned by someone else |
| `You cannot publish over the previously published versions` | Run `yarn version-packages` to bump version |
| `ENEEDAUTH` | Run `npm login` or set `NPM_TOKEN` |
| Package missing `dist/` | Run `yarn build` before publish (`prepack` also builds) |

---

## Package README on npm

npm shows each package's `description` and, if present, a `README.md` in the package directory. Add short `packages/*/README.md` files later if you want richer npm pages; the root README links to the monorepo docs.

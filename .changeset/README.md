# Changesets

This folder stores pending release notes. When you are ready to publish:

1. Run `yarn changeset` and describe what changed.
2. Merge the generated markdown file to `main`.
3. Run `yarn version-packages` (or let CI do it) to bump versions and update changelogs.
4. Run `yarn release` to build and publish to npm.

See [docs/PUBLISHING.md](../docs/PUBLISHING.md) for the full walkthrough.

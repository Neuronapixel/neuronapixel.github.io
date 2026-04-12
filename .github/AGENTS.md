# DevOps Guide For `/.github`

## Role
This subtree agent acts as the DevOps and delivery steward. It owns GitHub-side automation, release-safe workflow changes, and collaboration assets that shape how changes move through the repository.

## Scope
- GitHub Actions workflows in `.github/workflows/`.
- PR and issue templates, labels, and repository automation files under `.github/`.
- Delivery-facing documentation and policies when they affect CI, release, or deployment behavior.

## Guardrails
- Follow the root `AGENTS.md` for repo-wide constraints.
- Do not break the existing GitHub Pages deployment path.
- `.github/workflows/pages.yml` deploys fresh `dist/` output on pushes to `master`.
- The application uses hash-based routing, so Pages-compatible behavior must be preserved unless deployment strategy changes intentionally.
- Do not replace or bypass the current release pipeline.
- `commitlint` and Conventional Commits remain required.
- `semantic-release` remains the release publisher.
- `.github/workflows/node.js.yml` remains the validation and release entry point unless an intentional migration is approved.
- Preserve the current `release-dry-run` behavior for PRs and manual previews unless there is a documented reason to change it.
- Keep Node and npm expectations aligned with `package.json`.
- Prefer additive, reversible workflow changes with explicit permissions and minimal privilege.

## Working Agreements
- When automation changes also affect `package.json`, `commitlint.config.cjs`, `branch-naming.md`, or `.husky/*`, coordinate through the root guide and document the coupling.
- Preserve fast feedback. Local hooks should stay helpful and deterministic, not duplicative or brittle.
- Document any new secret, variable, permission, or manual step in both the workflow change and the relevant repository docs.
- Treat PR titles as release-adjacent metadata. Recommend Conventional Commit-style titles for squash-merge compatibility, but do not create a conflicting process.

## Validation
- For CI, release, or deployment changes, review affected workflows end to end and run `npm run check && npm run build` unless the change is documentation-only.
- Call out any validation that cannot be run locally.

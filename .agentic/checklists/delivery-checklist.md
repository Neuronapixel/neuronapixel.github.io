# Delivery Checklist

Use this checklist for changes that can affect collaboration, CI, release, routing, analytics, or deployment.

## Release Hygiene
- [ ] Commit messages follow Conventional Commits.
- [ ] PR title uses Conventional Commit style if squash merge is likely.
- [ ] semantic-release behavior is unchanged, or the change is explicitly documented and reviewed.

## CI / Automation
- [ ] `.github/workflows/node.js.yml` still validates the intended Node and npm workflow.
- [ ] `.github/workflows/pages.yml` still builds from `dist/` and preserves the GitHub Pages deploy path.
- [ ] Any new secret, variable, permission, or manual step is documented.

## App / Delivery Surface
- [ ] Hash-based routing still behaves as expected.
- [ ] `public/CNAME`, manifest, sitemap, and OG assets remain correct if touched.
- [ ] GTM or browser-visible environment variable changes are documented.

## Validation
- [ ] `npm run check` completed, or the reason it could not run is recorded.
- [ ] `npm run build` completed for deploy-affecting changes, or the reason it could not run is recorded.

## Docs / Handoff
- [ ] Relevant `AGENTS.md`, README, or templates were updated when workflow expectations changed.
- [ ] Handoff notes capture remaining risk, manual checks, and follow-up work.

# Repository Oversight

## Role
This is the primary agent contract for the repository. It governs project-wide decisions, routes work to the right local agent, and protects deployment, release, and developer-experience guardrails.

## Authority & Routing
- Root instructions apply everywhere unless a deeper `AGENTS.md` adds stricter local guidance for its subtree.
- Use the most specific guide for the files being changed.
- `/src/AGENTS.md` covers product and application development.
- `/.github/AGENTS.md` covers CI, release, and GitHub automation.
- Cross-cutting work that spans app code and delivery automation should be coordinated from this root guide.
- Treat `/.github/AGENTS.md` as the automation policy reference when changes touch `package.json`, `commitlint.config.cjs`, `branch-naming.md`, or `.husky/*`.
- Use the orchestration artifacts in `/.agentic/` when a task needs a brief, a handoff, or a delivery checklist.

## Workflow Goals
- Optimize for fast local feedback, small safe changes, and low-friction collaboration between humans and AI agents.
- Keep instructions close to the code and automation they govern.
- Extend the existing GitHub Actions, commitlint, and semantic-release setup instead of adding parallel release or deployment processes.
- Update guidance when workflow expectations change so the repo stays easy to operate.

## Project Focus & Architecture
This repository powers the Neuronapixel site: a Vue 3 + Vite experience for interactive web, XR, and multimedia experiments. The primary landing route is the A-Frame-powered `src/views/XRVersionTwo.vue`, while legacy and project-specific pages remain available through Vue Router. Routing uses `createWebHashHistory()` in `src/router/index.ts`, so preserve hash-based URLs unless the deployment strategy changes. A-Frame and `aframe-extras` are loaded from CDN in `index.html`, and optional Google Tag Manager injection is handled in `src/utils/injectTagManager.ts`.

## Project Structure & Module Organization
`src/main.ts` bootstraps the app, router, and GTM integration. Keep route-level pages in `src/views/`, shared UI in `src/components/`, reusable helpers in `src/utils/`, and ambient typings in `src/types/` or `src/*.d.ts`. Static assets that must be processed by Vite belong in `src/assets/`; passthrough files for GitHub Pages such as `CNAME`, the manifest, sitemap, and OG assets belong in `public/`. `docs/` may contain a checked-in build snapshot, but the active deployment path is the GitHub Actions workflow that publishes fresh `dist/` output, so do not treat `docs/` as the source of truth for feature work.

## Build, Test, and Development Commands
- `npm run dev` starts the Vite dev server.
- `npm run build` creates the production bundle in `dist/`.
- `npm run serve` previews the built site locally.
- `npm run lint` runs ESLint.
- `npm run lint:fix` runs ESLint with auto-fix.
- `npm run typecheck` runs `vue-tsc --noEmit`.
- `npm run test` starts Vitest in watch mode.
- `npm run test:run` runs Vitest once.
- `npm run test:ui` opens the Vitest UI.
- `npm run test:coverage` generates coverage with the V8 provider.
- `npm run check` is the default local quality gate and should pass before submitting changes.
- `npm run release -- --dry-run` previews semantic-release output without publishing.

## Delivery Workflow
- Start from this root guide, then move to the deepest matching `AGENTS.md` for the target files.
- Use `/.agentic/templates/task-brief.md` for work that spans multiple areas, carries release risk, or needs explicit acceptance criteria.
- Use `/.agentic/templates/handoff.md` whenever work moves between humans or agents, or when stopping with partial progress.
- Use `/.agentic/checklists/delivery-checklist.md` before merging changes that affect routing, CI, release, analytics, or deployment.
- Keep changes small and reversible when possible; document why a broader change is necessary when it is not.

## Coding Style & Naming Conventions
Use TypeScript, Vue 3 Composition API, and `<script setup>` for SFCs unless an existing file clearly follows a different pattern. Follow the ESLint configuration with 2-space indentation and single quotes in scripts. Keep component filenames kebab-case when that pattern already exists, but preserve established repo naming where views use mixed legacy names such as `XRVersionTwo.vue` or `VRama.vue`; prefer consistency with nearby files over blanket renames. Keep composables and utilities camelCase, and avoid changing route paths or names casually because they are part of the published site surface.

## XR, Assets, and Environment Notes
WebXR-related work often needs HTTPS during local testing. Use `VITE_DEV_SSL_KEY` and `VITE_DEV_SSL_CERT` with files in `certs/` when testing on devices, and do not commit generated keys. Use `VITE_GTM_ID` for analytics; do not introduce browser-exposed environment variables without the `VITE_` prefix and a clear need. When editing XR views, verify any A-Frame assumptions against the CDN-loaded runtime and keep graceful behavior in mind for browsers that do not support immersive features.

## Testing Guidelines
Vitest and `@vue/test-utils` cover app bootstrap, router behavior, GTM injection, and shared components. Place tests beside the implementation as `*.test.ts` files. Prefer DOM-level assertions and route-level behavior checks over brittle implementation details. For most changes, run `npm run check`; for router, XR landing, or shared component changes, add or update focused Vitest coverage near the modified module.

## Commit, PR, and Release Guidelines
- Branch names must follow `branch-naming.md`; Codex-created branches should start with `codex/`.
- Use Conventional Commits because `commitlint` and `semantic-release` enforce them.
- Prefer Conventional Commit-style PR titles such as `feat(xr): refine landing scene` when squash merge is likely, so release semantics stay clear.
- PRs should summarize intent, link the relevant issue when available, include test evidence such as `npm run check && npm run build`, and attach screenshots or recordings for UI or XR-facing changes.
- Call out route changes, environment variable changes, analytics changes, CI or release changes, and deployment-impacting updates explicitly.
- Do not introduce a new release or publish path that bypasses semantic-release.

## Deployment & Release Notes
GitHub Pages is deployed by GitHub Actions on pushes to `master`, with `dist/` uploaded as the Pages artifact. Keep the repository Pages source configured for `GitHub Actions`, and preserve `public/CNAME` for the custom domain unless the domain changes intentionally. Pull requests and dry runs may execute semantic-release in preview mode, so keep commit history and release-relevant metadata clean. Changes to GitHub Actions or release automation must preserve the existing `validate`, `release`, and `release-dry-run` responsibilities unless a deliberate migration is approved.

## Agentic Orchestration Artifacts
- `/.agentic/README.md`: overview of the layered workflow and task-routing model.
- `/.agentic/templates/task-brief.md`: template for cross-cutting or higher-risk work.
- `/.agentic/templates/handoff.md`: template for human-agent and agent-agent handoffs.
- `/.agentic/checklists/delivery-checklist.md`: merge-time checklist for CI, release, routing, and deployment risk.

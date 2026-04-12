# Staff SWE Guide For `/src`

## Role
This subtree agent acts as the staff software engineer for the application. It owns product code, frontend architecture, maintainability, and app-facing developer experience inside `src/`.

## Scope
- Vue app bootstrap, routing, views, components, utilities, and app typings.
- Testing colocated with application code.
- Refactors that improve readability, composability, type safety, and local feedback loops for product development.

## Operating Rules
- Follow the root `AGENTS.md` for repo-wide constraints and delivery guardrails.
- Preserve hash-based routing via `createWebHashHistory()` unless the deployment strategy explicitly changes.
- Keep the XR landing experience in `src/views/XRVersionTwo.vue` functional and treat A-Frame assumptions as CDN-runtime dependent.
- Use Vue 3 Composition API and `<script setup>` unless the local file clearly uses an established alternative.
- Keep route-level pages in `src/views/`, shared UI in `src/components/`, reusable helpers in `src/utils/`, and ambient typings in `src/types/` or `src/*.d.ts`.
- Preserve nearby naming conventions. Do not rename published routes or legacy view filenames casually.
- Prefer incremental refactors over broad rewrites when the goal is maintainability or DX improvement.

## XR, Analytics, And Environment Constraints
- WebXR work should remain graceful on browsers that lack immersive support.
- Local device testing may require `VITE_DEV_SSL_KEY` and `VITE_DEV_SSL_CERT`; do not commit generated certificates or keys.
- Use `VITE_GTM_ID` for analytics wiring and require a clear rationale before introducing any new browser-visible environment variable.

## Testing & Validation
- Add or update colocated `*.test.ts` files for meaningful behavior changes.
- Prefer DOM-level assertions and route behavior over brittle implementation-detail tests.
- Run `npm run check` for normal app changes.
- Run `npm run check && npm run build` when touching routing, bootstrap, the XR landing page, analytics injection, or any change that can affect GitHub Pages output.

## Coordination & Escalation
- Coordinate with `/.github/AGENTS.md` before changing workflows, release rules, labels, or GitHub automation.
- Use `/.agentic/templates/task-brief.md` for cross-cutting work that spans `src/` and delivery automation.
- Record release, CI, analytics, or deployment impact in the handoff template when relevant.

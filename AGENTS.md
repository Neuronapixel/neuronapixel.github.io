# Repository Guidelines

## Project Structure & Module Organization
`src/` contains the Vue 3 application (components, views, router, composables in `utils/`, and TypeScript shims). Unit tests live next to entry points (`main.test.ts`, `src/App.test.ts`) to keep fixtures close to the code. Static assets go under `src/assets/` for bundling and `public/` for passthrough files, while `docs/` stores authored documentation and `certs/` is reserved for local HTTPS keys (never commit production secrets).

## Build, Test, and Development Commands
- `npm run dev` starts the Vite dev server; export `VITE_DEV_SSL_KEY` and `VITE_DEV_SSL_CERT` when serving over HTTPS with the files in `certs/`.
- `npm run build` produces the production bundle (set `VITE_GA_ID` beforehand for analytics).
- `npm run serve` previews the bundled site, mirroring production routing.
- `npm run lint` runs ESLint with auto-fix for `.js/.ts/.vue` sources.
- `npm run test`, `npm run test:ui`, and `npm run test:coverage` run Vitest in CLI, UI, and coverage modes, respectively.

## Coding Style & Naming Conventions
Use TypeScript and the Vue Composition API; prefer `<script setup>` and self-contained SFCs. Follow the ESLint config in `eslint.config.js` (Vue + @typescript-eslint + Prettier) with 2-space indentation, single quotes in scripts, and kebab-case component file names while exporting PascalCase component names. Keep utility modules camelCase (`src/utils/useFoo.ts`) and route modules suffixed with `.route.ts`. Run `npm run lint` before every commit to avoid CI noise.

## Testing Guidelines
Vitest plus `@vue/test-utils` powers the test suite. Place specs beside the implementation as `*.test.ts` files to share helpers. Use descriptive `describe` blocks (`describe('AppView', ...)`) and prefer DOM-level assertions so regressions surface in CI. Run `npm run test` locally, inspect flaky cases with `npm run test:ui`, and refresh coverage reports via `npm run test:coverage`; keep new features covered around their public API surface.

## Commit & Pull Request Guidelines
Branch names must follow `branch-naming.md` (e.g., `feat/onboarding-wizard`; Codex-created branches start with `codex/`). Commits follow Conventional Commits enforced by `commitlint` and `semantic-release`, e.g., `fix(router): guard immersive route`. Each PR should summarize intent, link the tracking issue, list test evidence (`npm run lint && npm run test`), and include screenshots or recordings for UI-affecting changes. Note any environment variable or infrastructure changes explicitly.

## Security & Configuration Tips
Use mkcert to populate `certs/` and export the matching Vite SSL variables; never check the generated keys into Git. Keep `.env.*` files local—only `VITE_*` variables are exposed to the browser, so audit additions carefully. Review `npm run release -- --dry-run` before publishing to ensure credentials and tokens are configured correctly.

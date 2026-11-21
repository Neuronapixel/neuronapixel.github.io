# Neuronapixel

Neuronapixel is a Vue 3 + Vite site for interactive web, XR, and multimedia experiments. The current default landing route is an A-Frame-powered WebXR scene, with additional legacy and project-specific pages exposed through Vue Router.

## Current Status

Status verified locally on April 12, 2026:

- `npm run check` passes
- `npm run build` passes
- Production output is generated into `dist/`
- GitHub Pages deploys from GitHub Actions on pushes to `master`

## Tech Stack

- Vue 3
- Vite 8
- TypeScript
- Vue Router 5
- Vitest + `@vue/test-utils`
- ESLint
- Sass via `sass-embedded`
- A-Frame and `aframe-extras`, loaded from CDN in [`index.html`](./index.html)

## Runtime Requirements

- Node.js `>=24.14.1 <25`
- npm `>=11 <12`

## Application Structure

- [`src/main.ts`](./src/main.ts): app bootstrap and Google Tag Manager injection
- [`src/router/index.ts`](./src/router/index.ts): hash-based router configuration
- [`src/views/`](./src/views): route-level views, including the XR landing page
- [`src/components/`](./src/components): shared UI components
- [`src/utils/injectTagManager.ts`](./src/utils/injectTagManager.ts): optional GTM script injection
- [`public/`](./public): static files such as `CNAME`, manifest, sitemap, and OG assets

The router uses `createWebHashHistory()`, which keeps direct GitHub Pages hosting simple without additional server-side rewrite rules.

## Agentic Development

This repository uses a layered, vendor-neutral `AGENTS.md` workflow so humans and AI agents can route work consistently without bypassing the existing delivery setup.

- [`AGENTS.md`](./AGENTS.md): project oversight, cross-cutting guardrails, and delivery policy
- [`src/AGENTS.md`](./src/AGENTS.md): staff SWE guide for application code
- [`.github/AGENTS.md`](./.github/AGENTS.md): DevOps guide for CI, release, and GitHub automation
- [`.agentic/`](./.agentic/): workflow docs, task brief, handoff template, and delivery checklist

The workflow is intentionally built around the current GitHub Pages deployment, GitHub Actions validation, commitlint, and semantic-release flow instead of introducing parallel processes.

## Current Routes

- `/`: `XRVersionTwo.vue`, the current WebXR landing experience
- `/classic`: legacy home view
- `/about`: about page
- `/vr-ama`: VR AMA page
- `/memoria-virtual`: Memoria Virtual page
- `/neurona-tornasol`: Neurona Tornasol page
- `/:pathMatch(.*)*`: not found page

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Run the local quality gate:

   ```bash
   npm run check
   ```

5. Build for production:

   ```bash
   npm run build
   ```

6. Preview the production build:

   ```bash
   npm run serve
   ```

## Local HTTPS for XR Testing

Mobile browsers typically require HTTPS for WebXR-related testing. The Vite config supports optional local certificates through environment variables.

Recommended setup with [mkcert](https://github.com/FiloSottile/mkcert):

```bash
brew install mkcert
mkcert -install
mkdir -p certs
mkcert -key-file certs/dev-key.pem -cert-file certs/dev-cert.pem \
  localhost 127.0.0.1 192.168.x.x
```

Replace `192.168.x.x` with your machine's LAN IP, then export:

```bash
export VITE_DEV_SSL_KEY="$PWD/certs/dev-key.pem"
export VITE_DEV_SSL_CERT="$PWD/certs/dev-cert.pem"
npm run dev
```

If both files exist, Vite serves locally over HTTPS on port `5173`.

## Environment Variables

- `VITE_GTM_ID`: optional Google Tag Manager container ID
- `VITE_DEV_SSL_KEY`: optional path to the local HTTPS key
- `VITE_DEV_SSL_CERT`: optional path to the local HTTPS certificate

Example values live in [`.env.example`](./.env.example).

## Analytics

The site loads Google Tag Manager when `VITE_GTM_ID` is set. The existing container controls GA4 page views. The app queues two additional events in `dataLayer`.

| Event | Data layer variable and GA4 parameter | Values |
| --- | --- | --- |
| `ui_click` | `action_name` | `enter_ar`, `retry_ar`, `exit_ar`, `open_quick_look`, `download_model`, `return_to_sky` |
| `visit_device` | `headset_type` | `meta_quest`, `unclassified` |

`ui_click` measures activation of a Sky Window control or link. Quick Look and the model download share a link and emit the action shown to the visitor. `visit_device` fires once at app startup per full page load. Use GA4's **Operating system** and **Device category** dimensions for Android, iOS and iPadOS, and desktop, mobile, and tablet traffic. Headset classification uses the Meta Quest Browser signal and leaves other browsers as `unclassified`. Use the `ui_click` event count for actions and filter to `visit_device` when analyzing the headset breakdown.

### Tag Manager setup

For local preview, set `VITE_GTM_ID` in `.env.local` to the container you want to test, then start the dev server. Use the HTTPS dev setup above for mobile and headset checks.

1. Create Data Layer Variables for `action_name` and `headset_type`. For each event in the table, create a Custom Event trigger with the matching name and a GA4 Event tag with the mapped parameter. Use the existing web stream and its consent settings. Keep the current page-view tag and triggers. [GTM event setup](https://support.google.com/tagmanager/answer/13034206)
2. In GA4, register `action_name` and `headset_type` as event-scoped custom dimensions. [GA4 custom dimensions](https://support.google.com/analytics/answer/14240153?hl=en)
3. In GTM Preview and GA4 DebugView, compare initial and hash-route page views against the current container. Verify a single `ui_click` per activation, a single `visit_device` per full load, and no duplicate action counts from existing automatic click or download tags. Check desktop, Android Chrome, iPhone Safari, and Meta Quest over HTTPS. Verify that navigation, AR entry and exit, and Quick Look or download work as before. Then publish the validated GTM workspace. [GTM Preview](https://support.google.com/tagmanager/answer/6107056?hl=en) · [GA4 DebugView](https://support.google.com/analytics/answer/7201382?hl=en)

## Available Scripts

- `npm run dev`: start the Vite dev server
- `npm run build`: create the production bundle in `dist/`
- `npm run serve`: preview the built site locally
- `npm run lint`: run ESLint
- `npm run lint:fix`: run ESLint with auto-fix
- `npm run typecheck`: run `vue-tsc --noEmit`
- `npm run test`: start Vitest in watch mode
- `npm run test:run`: run Vitest once
- `npm run test:ui`: open the Vitest UI
- `npm run test:coverage`: generate coverage with the V8 provider
- `npm run check`: run lint, typecheck, and tests
- `npm run release`: run semantic-release

## Testing and CI

- Unit tests currently cover the app bootstrap, router, GTM injector, and shared components
- CI runs `npm run check` and `npm run build` on pushes and pull requests targeting `master`
- On pushes to `master`, semantic-release runs after validation
- Pull requests and manual dry runs also execute `npm run release -- --dry-run`

## Deployment

- GitHub Pages deployment is defined in [`.github/workflows/pages.yml`](./.github/workflows/pages.yml)
- The workflow builds the site and uploads `dist/` as the Pages artifact
- Keep the repository Pages source set to `GitHub Actions`
- `public/CNAME` is committed for the custom domain

The repository also contains a checked-in [`docs/`](./docs) build snapshot, but the active deployment workflow publishes the freshly built `dist/` artifact.

## Branch Naming

Refer to [`branch-naming.md`](./branch-naming.md) for branch naming conventions. Codex-created branches should use the `codex/` prefix.

## Release Preview

To inspect the next semantic-release output without publishing:

```bash
npm run release -- --dry-run
```

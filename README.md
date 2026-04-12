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

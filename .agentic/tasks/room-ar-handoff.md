# Handoff — Handheld sky window

## Summary
Implemented `/#/ar` as a separate handheld sky experience. Shared logo geometry and environment preserve the original landing's transforms, flight controls, bobbing, cloud renderer and three-minute day/night cycle. The new route uses an identity camera, 0.1 logo scale and one-time placement 1.5 metres horizontally ahead of the first usable positional pose.

## Current Status
- Done: implementation, colocated tests, lint/type checks, production build and desktop/mobile preview QA.
- Pending: trusted-HTTPS physical handheld acceptance and a short recording walking away from and around the logo. No compatible physical device was available in this session. Deployment and physical-device acceptance remain pending.

## Files Touched
- `src/components/logo-mark.vue`, `src/components/sky-environment.vue`: reusable visual and environment; direct logo materials avoid A-Frame's scene-only asset-container constraint.
- `src/views/XRVersionTwo.vue`: reuse shared components; preserve published landing behavior.
- `src/views/SkyWindow.vue`: capability/entry/retry UI, opaque scene, overlay Exit control and in-scene tracking guidance when DOM overlay is unavailable.
- `src/utils/arPlacement.ts`, `src/utils/roomArSession.ts`, `src/utils/skyScene.ts`: pose math, lifecycle, pinned-runtime structural types and viewer-pose access.
- Router, colocated tests and this task's brief/handoff.

## Validation
- `npm run check`: passed, 41 tests across 16 files; Node 24.14.1 / npm 11.11.0.
- `npm run build`: passed without warnings.
- `git diff --check`: passed.
- Independent comparison against the original landing confirmed the exact original 27 positions and primary/secondary material assignments.
- Browser plugin not available; used the already-cached Playwright CLI and Chromium 149.0.7827.55. No dependency installation or package changes.
- Flow: `http://127.0.0.1:5173/#/ar` → unsupported preview → Explore the original sky → `/#/`. Both pages rendered without application errors. The pinned A-Frame runtime emits a Three.js `useLegacyLights` deprecation warning.
- Preview screenshots: `/private/tmp/neuronapixel-ar-desktop.png` (1280 × 800), `/private/tmp/neuronapixel-ar-mobile.png` (390 × 844); landing: `/private/tmp/neuronapixel-landing.png`.
- Runtime inspection: one scene, 27 logo cubes, sky material opacity 1 / transparent false / back-facing flat shader, no built-in XR entry buttons, no mobile horizontal overflow.
- Mocked support and permission rejection exercise the rendered entry/retry flow. These are UI tests, not evidence of physical tracking.
- Unit/component coverage includes unsupported and rejected probes, readiness, click-only entry, denial/retry, no concurrent requests, vertical headings, missing/emulated tracking, fixed placement after viewer movement, tracking loss, re-entry, reset, overlay/native-exit paths, delayed results/unmount, tracked environment translation and cycle continuity.

## Decisions / Risks
- A-Frame owns session creation and rendering. Call `scene.enterAR()` synchronously from the click and register scene behaviors through `addBehavior`; no second XR session or independent animation loop.
- WebXR is configured before initialization with `referenceSpaceType: local`, required `local`, optional DOM overlay and an existing overlay root. Use `xr-mode-ui`, the supported name in 1.5.
- The sky is explicit opaque geometry; A-Frame clears the scene background during AR rendering, so a background color alone is insufficient. Environment translation follows the pose in the renderer's own reference space; orientation does not follow the device. The logo root remains a separate scene child.
- DOMPoint coordinates are copied explicitly because their getters need not be enumerable. The environment keeps a single monotonic cycle clock through entry/exit.
- Reference reset clears placement and ends the session. Tracking loss retains the placed translation. Drift-free tracking and persistence across sessions are not promised.
- Initial size/distance are tuning defaults from the plan. Actual projected size depends on orientation; scale is constant in metres.

## Physical Acceptance Record — Pending
Test over trusted HTTPS using the existing `VITE_DEV_SSL_KEY` / `VITE_DEV_SSL_CERT` setup. Do not commit certificates.

| Check | Result |
| --- | --- |
| Device, OS and browser/version | Pending |
| Opaque sky coverage during immersive AR, including all viewing directions | Pending |
| Approximately 30 cm logo / 1.5 m initial placement | Pending |
| Walk away: logo appears smaller; sideways/around movement changes perspective | Pending |
| Look away and return: original placement retained; describe observed drift | Pending |
| Exit/re-enter creates fresh placement | Pending |
| Actual permission denial and unsupported handheld browser | Pending |
| Clouds, stars and day/night transition during immersive presentation | Pending |
| Device rotation turns through sky without rotating the environment | Pending |
| Short walking demonstration recording | Pending |

## Delivery Checklist Review
- Hash router retains every existing route and adds `/ar` with a lazy-loaded view.
- GitHub Actions, semantic-release, package/lock files, CNAME, sitemap, GTM and environment variables are unchanged. No new release or deployment path.
- Local quality gate/build passed. No merge or release was performed; commit and PR-title checks remain applicable at delivery (suggested title: `feat(xr): add handheld sky window`).
- Workflow expectations did not change, so no AGENTS.md or template edits were needed.
- Physical acceptance and recording remain required before calling device validation complete.

## Runtime References
- [A-Frame 1.5 scene source: enterAR, addBehavior and AR background handling](https://raw.githubusercontent.com/aframevr/aframe/v1.5.0/src/core/scene/a-scene.js)
- [A-Frame 1.5 WebXR system configuration](https://raw.githubusercontent.com/aframevr/aframe/v1.5.0/src/systems/webxr.js)
- [A-Frame 1.5 XR UI configuration](https://aframe.io/docs/1.5.0/components/xr-mode-ui.html)

## Local HTTPS Validation
The local preview and certificate-download servers are stopped. For device testing, the preview was served at `https://192.168.1.233:5173/#/ar`; the server certificate covers that address, localhost and 127.0.0.1. All generated development keys/certificates remain in ignored `certs/` and must not be committed. No Mac system trust store was changed.

Restart from the repository root with `VITE_DEV_SSL_KEY="$PWD/certs/dev-key.pem" VITE_DEV_SSL_CERT="$PWD/certs/dev-cert.pem" npm run dev -- --host 0.0.0.0`. A physical test device must install and explicitly trust the development CA, or use a publicly trusted HTTPS deployment. A Safari blank page was reported after bypassing a certificate warning; trusted-device loading has not been confirmed. Stopping the server does not remove device trust in the CA.

An unsupported-runtime preview crash was fixed: the fallback renderer did not expose `getReferenceSpace`. Pose reading now requires an active session/frame and guards the optional reference-space API; a regression test covers this runtime.

## Next Recommended Step
Complete trusted-HTTPS physical-device acceptance on a browser with immersive WebXR AR support, record walking away from and around the logo, then deliver through the existing PR and GitHub Pages workflow.

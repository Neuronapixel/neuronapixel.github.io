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
- `npm run check`: passed, 45 tests across 17 files; Node 24.14.1 / npm 11.11.0.
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

## Apple AR Quick Look Addition — October 27, 2026
- Added `ar-quick-look.vue` to `SkyWindow.vue`. Feature detection uses `relList.supports('ar')`. Supported browsers get “View in your space” with a `rel="ar"` link containing exactly one image; other browsers get a USDZ download and Safari guidance.
- The native path displays the logo over the real room. It preserves the separate sky/WebXR experience and does not claim to transfer the live sky/day-night scene into Quick Look. Unsupported WebXR browsers no longer show a disabled Enter button.
- `public/models/neuronapixel-logo.usdz` is a self-contained 4,207-byte binary USD package: 27 cubes matching the component positions and colours, Y-up/metres, a 30 cm unrotated cube with its base at Y=0, and a 12-second rotation. The native URL disables scaling. The accompanying PNG was rendered from that model with Apple's Metal renderer.
- Editable source and regeneration instructions: `src/assets/models/neuronapixel-logo.usda`, `src/assets/models/README.md`; `python3 scripts/generate-logo-usdz.py --thumbnail` was verified. It requires macOS USD tools, with no project dependency/build-pipeline changes.
- `usdchecker --arkit --strict` returned Success; package inspection confirmed an uncompressed, 64-byte-aligned, single USDC layer. The packaged model and thumbnail rendered successfully. Apple's packaging/checker tools emitted duplicate schema-registration diagnostics before reporting successful validation.
- Added a small Vite middleware hook for `Content-Type: model/vnd.usdz+zip` in development and production preview. Verified HTTP 200 for both and HTTP 206 with a 64-byte range in development. Vite retains ownership of static-file serving. No GitHub Actions changes were made; inspect the deployed GitHub Pages asset header after delivery.
- `npm run check` passed 45 tests across 17 files; `npm run build` passed. New coverage includes native feature detection, the exact AR link/image contract, no download attribute on the native link, missing/throwing capability probes, download fallback and native UI when WebXR is unavailable.
- Browser plugin not available: QA used cached Playwright/Chromium at 1280×800 and 390×844. Page identity/content, absence of framework overlays, native-button layout, loaded thumbnail, no horizontal overflow, one scene and 27 cubes passed. A real browser click downloaded the USDZ; its bytes matched the validated asset. No application console errors; the existing A-Frame/Three.js lighting deprecation warning remains.
- Screenshots: `/private/tmp/neuronapixel-quick-look-qa/desktop.png` and `/private/tmp/neuronapixel-quick-look-qa/iphone-ui.png`. The iPhone-sized screenshot simulates the native `rel` capability for UI validation only. It is not a screenshot of Apple's native viewer.
- Physical iPhone validation remains pending: open the HTTPS route in Safari, tap View in your space, place the logo, verify size/rotation, walk around it, then close the viewer and confirm return to the sky. Record iOS/device versions and any native-viewer issues. No deployment or push was performed.
- Primary references: https://webkit.org/blog/8421/viewing-augmented-reality-assets-in-safari-for-ios/ and https://openusd.org/release/spec_usdz.html .

## Apple AR Floating Animation — November 11, 2026
- Replaced the native model's spin with the web preview's sine easing: six seconds up, six seconds down, baked at 30 fps over a twelve-second loop. The heading stays fixed at −22° around Y. At the existing 0.5 root scale, the logo travels two centimetres vertically, with its base at or above the placement surface throughout.
- Updated the generator, editable USDA, packaged USDZ, and model README. The previous model's 27 cubes, material definitions, and fifteen-centimetre physical size are preserved. The existing thumbnail still represents the model's initial pose.
- Validation: `usdchecker --arkit --strict` reports Success. Inspection of both the source and packaged layer confirms 361 translation samples, matching endpoints, smooth rise/fall, and no animated rotation. Three Metal renders at 0, 6, and 12 seconds confirm visible movement and matching first/last frames. macOS USD tools continue to emit the previously observed duplicate schema-registration diagnostics during successful validation.
- The local HTTPS server returns the exact rebuilt USDZ bytes with HTTP 200, `Content-Type: model/vnd.usdz+zip`, and `Cache-Control: no-cache`. `npm run check` passes all 55 tests; `npm run build` and `git diff --check` pass. Physical Quick Look playback remains pending.

## Next Recommended Step
On a physical iPhone, open `https://192.168.1.233:5173/#/ar` in Safari and tap **Check out**. Close any existing Quick Look session first, then verify the gentle floating loop, fixed heading, placement, walking around the logo, and return to Safari. The original immersive-WebXR sky checklist remains a separate acceptance path for compatible devices. Review and deliver through the existing PR and GitHub Pages workflow.

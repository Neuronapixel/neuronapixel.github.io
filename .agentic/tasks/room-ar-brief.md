# Task Brief — Handheld sky window

## Objective
Implement the approved direction from `/private/tmp/neuronapixel-room-ar-plan.md`: use handheld positional tracking to explore the existing virtual sky, with the logo fixed in session space.

## Desired Outcome
Visitors open `/#/ar`, explicitly enter tracking, and see the logo approximately 1.5 metres ahead at their tracked height. The scene retains the opaque sky, cube clouds, stars and three-minute day/night cycle. The original landing remains available at `/#/`.

## Scope
- Shared logo and environment; dedicated AR preview, capability detection, placement and session cleanup.
- Local reference space, automatic one-time placement, 0.1 logo scale (approximately 30 cm across its unrotated geometry).
- Out of scope: surface scanning, persistent anchors, room imagery, occlusion, multi-device placement and headset acceptance.

## Constraints
Preserve the pinned A-Frame 1.5 CDN runtime, hash routing, landing transforms/flight/bobbing, GTM, CNAME and existing GitHub Actions/semantic-release deployment. A-Frame owns the XR session and render loop; environment updates run through scene ticks.

## Acceptance Criteria
- Explicit entry, useful fallback and retry UI; no concurrent entry requests.
- Logo hidden until valid positional tracking and horizontal heading; placement stays fixed through subsequent movement and tracking loss.
- Exit restores preview; re-entry creates a new placement; reference reset ends tracking and requests re-entry.
- Cleanup removes view-owned listeners/behaviors and ends owned sessions, including late session creation.
- Opaque geometry surrounds the viewer; environment follows translation without inheriting device orientation or moving the logo.

## Validation Plan
- `npm run check` and `npm run build` using Node 24.14.1.
- Real-browser desktop/mobile preview, fallback navigation, landing and console checks.
- Trusted-HTTPS handheld acceptance: full sky coverage, walking away/around, look-away/return, exit/re-entry, permission denial, day/night transition and drift recording.

## Release / Deployment Notes
Adds only `/#/ar`; existing published paths and delivery automation remain unchanged. No new dependency, environment variable or secret.

## Risks / Open Questions
Real tracking quality and camera coverage require a compatible physical device. Proposed size/distance are initial tuning defaults. A walking demonstration cannot be established by mocks or a desktop browser.

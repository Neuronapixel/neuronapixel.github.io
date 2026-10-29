# Neuronapixel AR logo

`neuronapixel-logo.usda` is the editable USD source for Apple AR Quick Look. The website serves its packaged counterpart and thumbnail from `public/models/`.

Regenerate from the exact cube positions and material colours in `src/components/logo-mark.vue`:

```sh
python3 scripts/generate-logo-usdz.py
# Also render the transparent thumbnail (requires Metal/GPU access):
python3 scripts/generate-logo-usdz.py --thumbnail
```

The script uses the USD tools included with current macOS: `usdzip`, `usdchecker` and optionally `usdrecord`. No project dependencies are required. The checked-in assets ship through the normal Vite → dist → GitHub Pages build; deployment does not run these macOS tools.

The model uses metres, Y-up, 27 cubes, two `UsdPreviewSurface` materials, and a centred twelve-second rotation. A root scale of 0.5 makes each cube five centimetres wide. Its base rests at Y=0 and its unrotated dimensions are 15 × 15 × 15 cm. Materials store the source sRGB colours in linear space. The Quick Look URL disables user scaling to keep the intended physical size.

Validate with `usdchecker --arkit --strict public/models/neuronapixel-logo.usdz`. Check that the hosted response uses `Content-Type: model/vnd.usdz+zip`. Vite supplies that header for development and production preview; confirm it on GitHub Pages after deployment.

The AR link has exactly one image child and is enabled using `relList.supports('ar')`. Unsupported browsers receive a model download. AR Quick Look opens Apple's native viewer over the real camera image; the website's sky and day/night cycle continue to belong to the separate web experience. Native viewer placement/animation and return to Safari still require physical-device QA.

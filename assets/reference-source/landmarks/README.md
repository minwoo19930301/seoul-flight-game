# Seoul landmark reference assets

Five independently authored game-art models made through the actual project-local Blender MCP connection. These are not official architectural models, surveys, engineering specifications or photogrammetry. The companion reference ledger distinguishes published heights from estimated plans and facade details.

## Release files

Repository layout: the GLBs, five standard render PNGs, `manifest.json` and `references.json` are in `../../landmarks/`; verification reports and `contact-sheet.png` are in `../../../docs/`. This directory contains the editable master and the three portable modeling scripts only. The development-only detail render and verification runners described below are not bundled here. Use `npm test` at the repository root for the included asset checks.

The existing runtime IDs are also the GLB filenames. Each GLB is standalone, with no linked images, cameras, lights, terrain or geographic offsets. Original geometric facade detail and simple PBR materials are batched by material. Reference photos are links only; no third-party photo is redistributed as a texture.

| Runtime ID / file | Landmark scope | Width × height × depth, metres | Triangles | Draw calls |
| --- | --- | --- | ---: | ---: |
| `sixtythree.glb` | 63 Building | 64.5 × 249.58 × 43.3 | 4,128 | 3 |
| `lotte.glb` | Lotte World Tower, open crown included | 71.5 × 555 × 71.5 | 12,888 | 3 |
| `nseoul.glb` | N Seoul Tower, transmission mast included | 28 × 236.7 × 28 | 4,572 | 5 |
| `coex.glb` | Trade Tower only, not exhibition hall/whole COEX | 61.48 × 256.5 × 42.06 | 6,352 | 3 |
| `gyeongbokgung.glb` | Geunjeongjeon hall and two-tier terrace only | 47 × 26 × 38 | 20,176 | 10 |

Total: **48,116 triangles, 24 material draw calls, 2,544,416 GLB bytes**. Largest GLB: 1,069,956 bytes. Lotte and Geunjeongjeon slightly exceed the approximate initial 12k/20k triangle targets; every file is below the enforced 22k triangles / 2 MB limit.

- `manifest.json`: ID mapping, real exported bounds, dimensions, material parameters, sources, hashes and estimated details.
- `references.json`: primary-source research ledger, footprint basis, height datums and conflicts.
- `seoul-landmarks.blend`: sanitized, editable source with five `LANDMARK_<id>` collections; enable one collection at a time. All local origins intentionally coincide. Do not export `STUDIO_NOT_EXPORTED`.
- `<id>.png`: 768 × 768 offline Cycles render. `nseoul-detail.png` shows the closed, continuous shaft/head connection.
- `contact-sheet.png`: each model is fitted independently; panels are **not** a common-height comparison.
- `validation.json`, `khronos-validation.json`, `preservation-and-source-proof.json`: independent verification evidence.

## Geometry and placement contract

glTF axes are +X width, +Y height, +Z front/depth. Roots and children have identity transforms; all geometry is in physical metres. The origin is horizontal bounds centre at finished floor Y=0. Apply placement, geographic yaw and terrain offset in the app, not inside the model. The master uses native Blender Z-up; export with the normal glTF Y-up option, selecting exactly one complete landmark collection including its root.

63 Building height is 249.58 m above ground. N Seoul is 135.7 m body plus 101 m transmission structure; its estimated 28 m observation head is not a 60 m dish. Its shaft/head junction is closed and includes a visible flared neck. Trade Tower is 228 m to roof and 256.5 m to mast tip. Lotte's 555 m includes its open twin-ear crown; there is no extra cone/antenna.

Geunjeongjeon's **26 m total height is an estimate, approximately ±4 m**, including the estimated 3.5 m terrace. The complete terrace is 47 × 38 m; do not use the smaller 32.04 × 23.57 m main-hall reference plan as the complete collision envelope. The two-tier paljak roof has horizontal ridges and upright gable ends, not a conical pagoda. This file is not a whole-palace reconstruction.

All facade spacing, crown subdivisions, small rooftop details, neck dimensions, material color/roughness, hidden structure and width/depth envelopes remain documented approximations. Not all official photo endpoints could be displayed by research tools; the models are bounded source-informed studies, not a claim of complete photo-by-photo fidelity. The app's Namsan terrain height and the operator/city elevation conflict are intentionally outside these assets.

## Verification and preservation

The binary verifier reads every actual POSITION accessor through the glTF hierarchy, checks dimensions to 0.0001 m, floor-centred origin, finite data, index bounds, unit normals, triangle-winding agreement and zero degenerate triangles. All five pass. The official Khronos validator reports **0 errors, 0 warnings, 0 infos** for all five GLBs.

The saved sanitized `.blend` was reopened through actual MCP, without model regeneration, then all five collections were re-exported into a separate QA folder. **All five complete GLB files, JSON structures and binary chunks are byte-identical** to the release. The source-proof report records each hash. The full uncompressed Blender file and release JSON/GLBs were scanned for local user directories, local username, workspace absolute paths and credential patterns; no matches were found. This pattern scan is not a general proof that an arbitrary binary could never contain sensitive data.

Both original and sanitized Interior furniture masters retained their pre-task SHA-256 values. No existing Interior file was overwritten. No user Blender document, global configuration, external asset service, key, account, browser/app session or GitHub state was changed. Offline asset rendering is not browser UI or flight-flow QA.

## Source scripts and private tooling

`mesh_library.py`, `build_models.py` and `prepare_assets.py` contain the pure modeling source. `verify_assets.py` independently creates the manifest and contact sheet from exported bytes and local renders. The remaining MCP runner, export/render/save wrappers and local stderr log are project-local operational tooling with machine-specific paths; they are not part of the public asset payload. Keep them in the workspace, not in a public release. The editable Blender master and pure modeling source are the portable source of the models.

The dedicated Blender service remains on loopback 127.0.0.1:9876. Its process-local safeguards disable external network access and persistent registrations; this is not an operating-system sandbox. Reopen the saved master for inspection before any subsequent export. Do not reset or reuse an unrelated user document.

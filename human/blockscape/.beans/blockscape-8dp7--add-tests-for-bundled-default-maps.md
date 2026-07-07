---
# blockscape-8dp7
title: Add tests for bundled default maps
status: completed
type: task
priority: normal
created_at: 2026-04-18T16:23:56Z
updated_at: 2026-04-18T16:26:00Z
---

Add automated coverage for the real default Blockscape maps used at startup: the inlined seed map and the bundled sample catalog (`models.bs`).

- [x] Extract the default seed map into a reusable module
- [x] Add tests covering validation and helper behavior for the seed map
- [x] Add tests covering validation and helper behavior for the sample catalog
- [x] Run unit tests and full build

## Summary of Changes

Extracted the inlined default seed map into `svelte/src/defaultSeed.js` so the app and tests share the same startup map definition. Added `svelte/tests/defaultMaps.test.js` to validate the bundled seed map and `models.bs` sample catalog, covering schema validation plus stable helper behavior such as item lookup, dependent discovery, category filtering, subgraph extraction, and catalog link expectations. Verified with `npm run test:unit` and `npm run build`.

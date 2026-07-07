---
# blockscape-sznq
title: Implement normalized global registry for Blockscape
status: completed
type: feature
priority: normal
created_at: 2026-04-18T16:34:15Z
updated_at: 2026-04-18T16:41:55Z
---

Refactor Blockscape to normalize loaded .bs maps into a global item registry while preserving .bs as the canonical file format.

- [x] Inspect current load/materialize/export/session code paths
- [x] Add pure global normalization/materialization/interleave module
- [x] Add unit tests for normalizeInto, mergeItem, materialize, interleave
- [x] Wire app ingest/render/export/query paths to use normalized global state
- [x] Update query runtime/docs for global scope
- [x] Run unit tests and full build

## Summary of Changes

Added a new normalized global registry module at `svelte/src/blockscapeGlobal.js` with pure `mergeItem`, `normalizeInto`, `materialize`, `interleave`, and graph helper functions. Wired the app to keep registry-backed `globalMapId` references on entries and versions, resync maps into the registry on ingest/edit/rebuild/export/query boundaries, and materialize active maps back into `.bs` shape for the existing renderer and editor. Exposed the registry to SCI as `global`, updated the query panel help text and documentation, and added unit coverage in `svelte/tests/blockscapeGlobal.test.js`. Verified with `npm run test:unit` and `npm run build`.

---
# blockscape-m22y
title: Implement SCI query and transform layer
status: completed
type: feature
priority: normal
created_at: 2026-04-18T13:02:18Z
updated_at: 2026-04-18T15:52:35Z
---

Add a browser-side SCI query/transform layer to the Svelte Blockscape app, including a pure model/runtime seam, dedicated Query tab, validation, and tests.

## Summary of Changes

Implemented a browser-side SCI query/transform layer for Blockscape. Added `svelte/src/blockscapeModel.js` for pure model helpers and validation, `svelte/src/sciRuntime.js` for controlled browser SCI execution, and a dedicated Query tab in `svelte/src/blockscape.js` with run/result/error/apply flow. Added Vitest unit coverage under `svelte/tests/` and a Cypress spec for the query panel. Verified with `npm run test:unit` and `npm run build`. Attempted Cypress execution, but the environment blocked it with a Cypress cache verification `EROFS` failure.

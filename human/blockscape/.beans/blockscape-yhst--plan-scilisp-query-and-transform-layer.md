---
# blockscape-yhst
title: Plan SCI/Lisp query and transform layer
status: completed
type: task
priority: normal
created_at: 2026-04-18T12:57:07Z
updated_at: 2026-04-18T13:01:01Z
---

Review the proposed SCI/Lisp integration for Blockscape against the current Svelte codebase, identify mismatches, and capture the design decisions/questions needed before implementation.

## Summary of Changes

Reviewed the proposed SCI/Lisp integration against the current Blockscape repo. Confirmed the app is Svelte-based with a custom DOM renderer, not Vue/Cytoscape/G6. Locked the v1 direction to preserve the full current `.bs` schema, scope SCI execution to the active map with read-only series helpers, ship a dedicated Query tab, defer AI to an interface stub, and first extract a JS model/runtime seam from `svelte/src/blockscape.js` before integrating SCI.

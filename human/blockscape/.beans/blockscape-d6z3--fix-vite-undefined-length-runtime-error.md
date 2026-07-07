---
# blockscape-d6z3
title: Fix Vite undefined length runtime error
status: completed
type: bug
priority: normal
created_at: 2026-04-18T15:55:26Z
updated_at: 2026-04-18T16:10:54Z
---

Investigate and fix the current Vite/runtime error 'Cannot read properties of undefined (reading length)' introduced after the SCI query layer changes.

## Summary of Changes

Switched the browser SCI loader from a Vite `?url` dependency import to a `?raw` import plus Blob-backed script injection, which bypasses Vite's sourcemap transform path for `scittle.js` in dev mode. Also fixed an unrelated unsafe optional-chain in the settings import path (`result?.applied?.length`). Verified with `npm run test:unit` and `npm run build`.

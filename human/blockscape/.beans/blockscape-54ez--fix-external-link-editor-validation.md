---
# blockscape-54ez
title: Fix external link editor validation
status: completed
type: bug
priority: normal
created_at: 2026-04-18T18:25:21Z
updated_at: 2026-04-18T18:25:48Z
---

## Goal

Stop the item editor from blocking save on non-browser-URL external link values.

## Todo

- [x] Update the external link editor field to avoid browser URL-only validation
- [x] Verify the change does not break item save behavior
- [x] Summarize the fix and any remaining caveats

## Summary of Changes

Changed the item editor External link field from a browser-validated `type="url"` input to a plain text input with `inputMode="url"`. This stops the browser from blocking save when users enter relative or other non-URL-shaped values that Blockscape can still handle. Verified the change with the full Vitest suite (`20` tests passing). No direct browser interaction test was added for this form field.

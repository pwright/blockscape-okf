---
# blockscape-3i3f
title: Handle in-app load links in current tab
status: completed
type: task
priority: normal
created_at: 2026-04-13T11:35:29Z
updated_at: 2026-04-13T11:38:35Z
---

Make catalog/item links like ?load=comms.bs load into the current Blockscape tab instead of opening a fresh browser tab.

- [ ] Inspect current external link handling for relative ?load= links
- [ ] Implement in-place load behavior and URL updates
- [x] Verify with a build or targeted check
- [x] Add summary and complete bean if all tasks are done

## Summary of Changes

- Added in-app link resolution for Blockscape URLs so `?load=...` and `/server/...` targets can be consumed inside the current tab.
- Reused the same internal handler for tile external-link buttons and normal anchor clicks, while preserving new-tab behavior for genuinely external URLs.
- Added URL/history updates plus item/map activation so the current tab reflects the loaded model after the in-place navigation.
- Verified the change with `npm run build`.

---
# blockscape-zzes
title: Enable center mode by default
status: completed
type: task
priority: normal
created_at: 2026-04-13T12:34:27Z
updated_at: 2026-04-13T12:34:49Z
---

Make the quick `Center` mode enabled by default for new sessions while preserving stored user preferences.

- [x] Update center-mode defaults in runtime and settings snapshot code
- [ ] Verify with a build
- [x] Add summary and complete bean if all tasks are done

## Summary of Changes

- Changed the quick `Center` mode fallback default from off to on.
- Updated the exported settings defaults to match the runtime fallback.
- Left persisted user preferences untouched; existing `localStorage` values still win.
- Verified the change with `npm run build`.

---
# blockscape-x0iv
title: Add center quick toggle
status: completed
type: task
priority: normal
created_at: 2026-04-13T12:29:02Z
updated_at: 2026-04-13T12:31:53Z
---

Add a new quick `Center` toggle in the tab action area. It should reuse the centered layout behavior without changing the existing Wardley toggle semantics.

- [ ] Add separate center-mode state and quick toggle wiring
- [x] Keep Wardley behavior unchanged
- [ ] Verify with a build
- [x] Add summary and complete bean if all tasks are done

## Summary of Changes

- Added a separate quick `Center` mode with its own persisted state.
- Kept `Wardley` as the staged centered mode in Settings.
- Made centered layout activate for either mode, while stage guides and stage placement remain tied to Wardley only.
- Verified the change with `npm run build`.

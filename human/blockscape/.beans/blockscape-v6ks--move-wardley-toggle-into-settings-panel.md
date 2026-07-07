---
# blockscape-v6ks
title: Move Wardley toggle into settings panel
status: completed
type: task
priority: normal
created_at: 2026-04-13T12:23:29Z
updated_at: 2026-04-13T12:24:07Z
---

Relocate the existing Wardley toggle UI into the settings panel while preserving its behavior.

- [ ] Find the current Wardley toggle and settings panel wiring
- [x] Move the toggle into the settings panel
- [ ] Verify with a build
- [x] Add summary and complete bean if all tasks are done

## Summary of Changes

- Removed the Wardley toggle from the tab-action area.
- Added the Wardley toggle as a standard settings-row control inside the Settings panel.
- Updated the center-mode sync helper to track the settings-panel control.
- Verified the change with `npm run build`.

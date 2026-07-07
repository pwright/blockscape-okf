---
# blockscape-il11
title: Add open-all button for linked models
status: completed
type: task
priority: normal
created_at: 2026-04-13T12:14:01Z
updated_at: 2026-04-13T12:19:08Z
---

Add a model action that loads all loadable external links from the active model into the current Blockscape tab/session.

- [ ] Inspect model action UI and active-model state wiring
- [x] Implement button plus load-all behavior for loadable Blockscape links
- [ ] Verify with a build
- [x] Add summary and complete bean if all tasks are done

## Summary of Changes

- Added an `Open all` action beside the model controls in the sidebar.
- Implemented bulk loading for Blockscape-resolvable item links in the active model, keeping the user on the original model after loading.
- Skipped links already present in the current session to avoid redundant reload/version churn.
- Verified the change with `npm run build`.

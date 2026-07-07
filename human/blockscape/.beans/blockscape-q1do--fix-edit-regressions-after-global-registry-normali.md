---
# blockscape-q1do
title: Fix edit regressions after global registry normalization
status: completed
type: bug
priority: normal
created_at: 2026-04-18T18:18:09Z
updated_at: 2026-04-18T18:20:52Z
---

## Goal

Restore editing operations that regress after the global registry normalization work.

## Todo

- [x] Audit direct map mutation paths for stale rematerialization regressions
- [x] Implement a shared sync path so edits persist before rebuild/rematerialize
- [x] Add or update tests covering add and move/edit flows
- [x] Verify the affected editing interactions and summarize residual risk

## Summary of Changes

Fixed the active-edit refresh path so `loadActiveIntoEditor()` first persists the active entry back into the normalized global registry before rematerializing JSON. This restores mutation flows that edit `models[activeIndex].data` in memory and then refresh, including add-item and keyboard move operations. Added unit coverage proving that normalizing the same map id a second time preserves later item additions and cross-category moves, and verified the full Vitest suite passes.

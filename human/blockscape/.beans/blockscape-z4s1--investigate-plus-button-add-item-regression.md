---
# blockscape-z4s1
title: Investigate plus button add-item regression
status: completed
type: bug
priority: normal
created_at: 2026-04-18T16:57:38Z
updated_at: 2026-04-18T16:59:32Z
---

## Goal

Explain why clicking `+` no longer adds an item.

## Todo

- [x] Trace the current `+` click handling path
- [x] Identify the condition blocking item insertion
- [x] Explain the root cause and workaround or fix

## Summary of Changes

Confirmed a regression caused by the normalized global registry flow. `addItemToCategory()` still appends a new item into `models[activeIndex].data`, but then immediately calls helpers that rematerialize the active map from `globalRegistry`. Because the registry is not updated first, the just-added item is discarded and the UI appears unchanged.

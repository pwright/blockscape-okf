---
# blockscape-lku4
title: Investigate plus button new-item form behavior
status: completed
type: task
priority: normal
created_at: 2026-04-18T16:55:47Z
updated_at: 2026-04-18T16:56:38Z
---

## Goal

Explain why clicking `+` does not open a create-item form.

## Todo

- [x] Inspect the `+` button action in the UI code
- [x] Check whether query mode disables item creation/editing
- [x] Answer the user with the root cause and any workaround

## Summary of Changes

Traced the `+` tile action in the Svelte source and confirmed it directly inserts a default item into the current category instead of opening the item editor modal. Confirmed the item editor is only opened through separate entry points such as `F2`/edit actions, and that category-query/derived views suppress add controls entirely.

---
# blockscape-slns
title: Investigate external link validation prompt
status: completed
type: task
priority: normal
created_at: 2026-04-18T18:23:44Z
updated_at: 2026-04-18T18:24:09Z
---

## Goal

Explain why the app prompts for an external link in the item editor.

## Todo

- [x] Inspect the item editor external-link field and form validation
- [x] Identify why the browser requires input there
- [x] Explain the cause and likely fix/workaround

## Summary of Changes

Confirmed the item editor uses `<input type="url">` for the External link field, so the browser blocks submit whenever that field contains a value it does not consider a valid URL. This is stricter than the runtime external-link handling, which can resolve some relative or bare paths. The editor also includes a separate checkbox for marking an item as external without providing a link.

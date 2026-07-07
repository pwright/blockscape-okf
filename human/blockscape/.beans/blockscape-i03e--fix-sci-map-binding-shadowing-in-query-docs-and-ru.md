---
# blockscape-i03e
title: Fix SCI map binding shadowing in query docs and runtime
status: completed
type: bug
priority: normal
created_at: 2026-04-18T16:20:22Z
updated_at: 2026-04-18T16:22:10Z
---

The query runtime binds the active model as `map`, which shadows the standard Clojure `map` function. Expressions like `(map :id (:categories map))` return the model id instead of mapping over categories.

- [x] Add a non-shadowing alias for the active model in SCI runtime
- [x] Update query panel help text
- [x] Update query documentation examples to use the alias
- [x] Run unit tests and docs build

## Summary of Changes

Added `model` as a second binding for the active Blockscape model in the SCI runtime so users can call the core Clojure `map` function without colliding with the existing `map` model binding. Updated the query tab default expression and help text to prefer `model`, rewrote the query reference examples to use `model`, and documented the `(map :id (:categories map))` shadowing trap explicitly. Verified with `npm run test:unit` and `npm run build`.

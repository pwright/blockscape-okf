---
type: BlockscapeDocs
title: Stages in Center view
id: blockscape-documentation-docs-documentation-stages
source_file: ../human/blockscape/documentation/docs/documentation/stages.md
generated_at: 2026-07-07T11:29:03Z
generator: copy-blockscape-markdown.sh
tags:
  - blockscape
---

# Stages in Center view

`stage` is an optional field on each item that nudges tiles to a horizontal position when Center view is enabled. It is most often used for Wardley-style maps.

## Values
- `1`: far left
- `2`: left
- `3`: right
- `4`: far right

Tiles try to sit in their requested stage column when Center is on; when multiple items want the same stage, Blockscape fills the nearest free horizontal columns (wrapping to a new row only after all four columns are taken). With Center off, or when `stage` is omitted, items flow normally.

Wardley interpretation:
- `1` → genesis
- `2` → custom-built
- `3` → product/rental
- `4` → commodity/service

## Example

```json
{
  "id": "my-item",
  "name": "Example",
  "stage": 3,
  "deps": ["supporting-item"]
}
```

## Shortcuts
- Center view on + `Shift` + `Arrow Left/Right` cycles stages 1→4 (wrapping around) without moving the tile.

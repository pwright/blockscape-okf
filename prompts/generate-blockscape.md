# Generate Blockscape Map

Use this prompt when creating or revising `.bs` maps from generated or reviewed OKF pages.

## Inputs

- Source pages from `generated/` or `reviewed/`.
- Existing maps from `maps/`.
- Source provenance from `sources/blockscape.md`.

## Rules

- Use valid `.bs` JSON.
- Keep map item ids stable when updating an existing map.
- Use `external` links for related OKF pages when a page is the best explanation of a node.
- Links to generated content should follow the published OKF base URL, for example `https://pwright.github.io/blockscape-okf/generated/blockscape/<slug>`.
- Prefer explicit dependencies from source material over inferred dependencies.

## Output

Return only the map JSON unless asked for an explanation.

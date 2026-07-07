# Add New Concept

Use this checklist when adding a new Blockscape OKF concept.

## Steps

1. Search source material under `human/blockscape/`.
2. Create a generated page in the best fitting directory under `generated/`.
3. Include YAML front matter with `status: generated`, `reviewed: false`, source paths, and the `blockscape` tag.
4. Add links to related generated or reviewed pages.
5. Update a map in `maps/` if the concept belongs in the Blockscape landscape.
6. Run `just maps` to refresh generated map pages.
7. Promote to `reviewed/` only after explicit human review.

## Concept Front Matter

```yaml
---
type: Concept
title: <title>
id: blockscape-concept-<slug>
status: generated
reviewed: false
source_repo: https://github.com/pwright/blockscape.git
source_commit: <commit>
source_paths:
  - human/blockscape/<path>
tags:
  - blockscape
---
```

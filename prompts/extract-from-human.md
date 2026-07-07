# Extract From Human Source

Use this prompt when turning `human/blockscape/` material into compact OKF pages.

## Rules

- Treat `human/blockscape/` as read-only source material.
- Always include source paths with the repo-name segment, for example `human/blockscape/README.md`.
- Prefer small pages about one concept, workflow, component, or map.
- Omit uncertain fields rather than guessing.
- Preserve source provenance in YAML front matter.
- Quote YAML string values by default, especially values containing `:`, `#`, `{}`, `[]`, quotes, or leading/trailing whitespace.

## Front Matter Template

```yaml
---
type: Concept
title: "<human-readable title>"
id: "blockscape-concept-<slug>"
status: generated
reviewed: false
source_repo: "https://github.com/pwright/blockscape.git"
source_commit: "<commit from sources/blockscape.md>"
source_paths:
  - human/blockscape/<path>
tags:
  - blockscape
---
```

## Output Shape

Write a concise page with:

- A direct description of the concept or workflow.
- The practical role it plays in Blockscape.
- Dependencies or related concepts when they are explicit in the source.
- Links back to source paths where useful.

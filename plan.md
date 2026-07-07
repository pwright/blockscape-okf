# MVP Plan

## Intention

Create a small, reproducible OKF-style workspace where the Blockscape repository is copied into `human/`, then used as the source for generated and reviewed agent-readable knowledge.

## Non-goals

- Do not replace the Blockscape app repository.
- Do not rewrite all docs with an LLM immediately.
- Do not treat generated notes as authoritative without review.
- Do not require a custom database, web app, or MCP server in the MVP.

## Milestones

### 1. Snapshot Source

Populate `human/blockscape/` from `pwright/blockscape` or a local `../blockscape` checkout and record the commit in:

```text
human/blockscape/_source.md
sources/blockscape.md
```

### 2. Generate First OKF Pages

Copy Blockscape markdown into:

```text
generated/blockscape/
```

Use `prompts/extract-from-human.md` to turn focused source material into smaller OKF pages under:

```text
generated/concepts/
generated/resources/
generated/workflows/
```

### 3. Promote Manually Reviewed Pages

Move selected generated files into `reviewed/` after human review.

### 4. Build Indexes

Generate indexes for:

```text
indexes/source-coverage.md
indexes/review-status.md
indexes/concepts.md
```

### 5. Generate Maps

Copy `.bs` files into `maps/` and wrap them as Quartz-friendly generated pages:

```text
generated/maps/
```

### 6. Add Agent Access Later

A later iteration can add:

```text
skills/
mcp-okf-server/
context-packs/
```

The MVP should stay file-based.

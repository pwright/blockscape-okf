# Blockscape OKF MVP

This repository is a minimal starting point for treating Blockscape as a curated human source and building an OKF-style LLM wiki beside it.

## Maps

- Generated Blockscape map pages are built from `.bs` files in `maps/`.
- Published map pages link back to the Blockscape app with a raw GitHub URL load target.

The intended split is:

```text
human/      copied upstream snapshots by repo name; do not edit directly
generated/  agent-produced OKF notes; disposable and rebuildable
reviewed/   human-promoted OKF notes; trusted enough for downstream use
indexes/    generated indexes and coverage reports
maps/       Blockscape JSON maps generated from reviewed or generated OKF
prompts/    reusable prompts for extraction, review, and mapping
sources/    provenance records for upstream repositories
_system/    local operating rules for humans and agents
```

The `human/` directory is populated by scripts. The primary source is:

```text
https://github.com/pwright/blockscape.git
```

When this repo sits beside `../blockscape`, `just init` uses that local checkout by default and avoids a network clone.
In that layout, `sources/blockscape` is a symlink to the live sibling checkout for convenient source navigation; `human/blockscape/` remains the copied snapshot used for reproducible OKF generation.

## Quick Start

```bash
just init
just tree
```

For an offline smoke test that does not contact GitHub:

```bash
just test
```

## Requirements

- `bash`
- `git`
- `rsync`
- `just`, optional but recommended
- `python3`, for map wrapping and Quartz staging helpers

## Basic Workflow

```text
1. Refresh human/blockscape/ from the Blockscape source repo.
2. Copy Blockscape markdown into generated/blockscape/.
3. Copy .bs maps into maps/ and wrap them as generated Markdown pages.
4. Validate front matter and source provenance.
5. Promote useful pages into reviewed/.
6. Stage and build Quartz when publishing is needed.
```

```bash
just sync-human
just maps
just quartz-stage
```

## Generated Content Policy

Generated content is not authoritative by default. Every generated or reviewed OKF file should record source provenance in YAML front matter.

Promoted files should move to `reviewed/` and set `status: reviewed` plus review metadata.

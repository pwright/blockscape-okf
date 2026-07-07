---
type: BlockscapeDocs
title: Using Blockscape with MkDocs
id: blockscape-documentation-docs-documentation-mkdocs
source_file: ../human/blockscape/documentation/docs/documentation/mkdocs.md
generated_at: 2026-07-07T11:29:03Z
generator: copy-blockscape-markdown.sh
tags:
  - blockscape
---

# Using Blockscape with MkDocs

Blockscape ships with an example MkDocs site that renders maps from fenced code blocks. Use it as-is for documentation or copy the pattern into another project.

## Prerequisites

- Node 20+ (repo uses `npm run export` to build the assets)
- Python 3 with MkDocs and the provided extension (`pip install -r documentation/requirements.txt`)

## Build the assets for MkDocs

From the repo root:

```sh
npm install            # first run
npm run export         # refreshes blockscape.js/.css and mount.js under documentation/docs/site_assets/blockscape/
```

You only need to rerun `npm run export` when the Svelte UI changes.

## Run or build the MkDocs site

From `documentation/`:

```sh
PYTHONPATH=documentation mkdocs serve   # live reload at http://127.0.0.1:8000/
PYTHONPATH=documentation mkdocs build   # static output to docs/documentation/
```

The root `npm run docs:build` script runs the same build. Avoid editing the generated HTML under `docs/`; rebuild instead.

## Author a map in Markdown

Create a fenced code block with `blockscape` containing your map JSON:


```
{
  "title": "Demo map",
  "categories": [    {
      "id": "shared-foundations",
      "title": "Shared Foundations",
      "items": [
        {
          "id": "experiments-learning",
          "name": "Experiments & Learning"
        },
        {
          "id": "custom-build",
          "name": "Custom Build"
        },
        {
          "id": "standard-components",
          "name": "Standard Components"
        }
      ]
    }
  ]
}

```

The plugin renders the interactive Blockscape view inline with local file access disabled.

Here is the same code, but with the mkdocs extension `blockscape` codefence:

```json
{
  "title": "Demo map",
  "categories": [    {
      "id": "shared-foundations",
      "title": "Shared Foundations",
      "items": [
        {
          "id": "experiments-learning",
          "name": "Experiments & Learning"
        },
        {
          "id": "custom-build",
          "name": "Custom Build"
        },
        {
          "id": "standard-components",
          "name": "Standard Components"
        }
      ]
    }
  ]
}

```


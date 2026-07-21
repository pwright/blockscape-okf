---
name: create-blockscape
description: Use when the user asks to create a blockscape, map, or series from a URL, file path, or pasted content. Analyses source content in depth and produces a `.bs` JSON file in `maps/`. Triggers on "create a blockscape", "map this", "blockscape from", "make a map of", or when given a URL/path with intent to visualise as a blockscape.
---

# Create Blockscape

## Objective

Analyse source content (URL, local file, or pasted text) and produce a blockscape map or series as a `.bs` file in the `maps/` directory.

## What is a blockscape

A blockscape is a visual value-chain map rendered from structured JSON:

- **Y-axis (vertical)**: visibility / user value -- top rows are user-facing outcomes, bottom rows are foundational infrastructure
- **X-axis (horizontal)**: maturity / evolution -- left items are least mature, right items are most mature (within each category, item order = left-to-right position)
- **Dependencies** (`deps`): draw connecting lines between items across categories

Position carries meaning. Moving an item changes the claim being made about it.

## Input

The user provides one of:

1. **A URL** -- fetch and analyse the page content
2. **A file path** -- read the local file
3. **Pasted content** -- analyse inline text

## Analysis process

Before generating JSON, deeply analyse the source content:

1. **Identify the domain** -- what system, process, or landscape does the content describe?
2. **Extract components** -- find the key entities, technologies, concepts, or actors
3. **Determine layers** -- group components into 3-5 categories ordered by visibility (user-facing at top, infrastructure at bottom)
4. **Establish dependencies** -- identify which components depend on which others
5. **Assess maturity ordering** -- within each category, order items left-to-right from least mature/novel to most mature/commoditised
6. **Decide map vs series**:
   - Use a **single map** when the content describes one coherent landscape
   - Use a **series** (JSON array) when the content has natural sub-topics, time periods, or a "map of maps" structure. A series has an index model whose item IDs match the sub-model IDs

## JSON schema

### Single map

```json
{
  "id": "kebab-case-id",
  "title": "Human-Friendly Title",
  "abstract": "Plain text or <p>HTML</p> description of what the map represents",
  "categories": [
    {
      "id": "category-id",
      "title": "Category Title",
      "items": [
        {
          "id": "item-id",
          "name": "Item Name",
          "deps": ["other-item-id"]
        }
      ]
    }
  ]
}
```

### Series (array of maps)

```json
[
  {
    "id": "index",
    "title": "Series Title - Index",
    "abstract": "Overview of the series",
    "categories": [...],
    "seriesId": "series-slug"
  },
  {
    "id": "sub-topic-1",
    "title": "Sub Topic 1 Detail",
    "categories": [...],
    "seriesId": "series-slug"
  }
]
```

In a series index, each item `id` should match a sub-model `id` so the viewer can link between them.

### Field rules

| Field | Required | Notes |
|-------|----------|-------|
| `id` | Yes | Lowercase, hyphens/underscores. Unique across all categories within a model |
| `title` | Yes | Human-friendly |
| `abstract` | Recommended | Plain text or HTML. Include source attribution if from a URL |
| `categories` | Yes | 3-5 categories ordered top (user-facing) to bottom (infrastructure) |
| `seriesId` | Series only | Lowercase slug shared by all models in the series |
| `deps` | Yes (can be `[]`) | Array of item IDs this component depends on. Cross-category deps are encouraged |
| `color` | Only if user requests | Hex color code, e.g. `"#ff0000"`. Used to track an item across a time series |
| `external` | Only if user requests | URL. Gives the tile a dashed border and launch icon |
| `logo` | Only if user requests | Image URL displayed on the tile |
| `stage` | Optional | Integer 1-4 for Wardley-style horizontal positioning |
| `backgroundUrl` | Optional | Background image URL for the map |

## Output rules

1. **Default: no color, no external URLs, no logos** -- only add these if the user explicitly requests them
2. Write the `.bs` file to `maps/` with a descriptive filename (e.g., `docs-topic-name.bs`)
3. Return only valid JSON in the `.bs` file
4. Use `abstract` to attribute the source (URL, file path, or "user-provided content")
5. Prefer 3-5 categories per model
6. Prefer 2-6 items per category
7. Every item must have a `deps` array (use `[]` for items with no dependencies)
8. Item IDs must be unique across all categories within a model
9. Dependencies should reflect genuine relationships from the source material, not inferred connections
10. Categories are ordered top-to-bottom by visibility; items within a category are ordered left-to-right by maturity

## After writing the file

1. Confirm the filename and location
2. Give a brief summary of what the map contains (number of categories, items, key relationships)
3. Suggest the user can view the map at `https://pwright.github.io/blockscape/?load=` with the raw GitHub URL of the `.bs` file, or by running `just maps` to generate the markdown wrapper

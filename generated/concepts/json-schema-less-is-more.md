---
type: Concept
title: JSON Schema: Less Is More
id: blockscape-concept-json-schema-less-is-more
status: generated
reviewed: false
source_repo: https://github.com/pwright/blockscape.git
source_commit: e98dd812f5e36f3e45f921f50369d511ccaaf88f
source_paths:
  - human/blockscape/documentation/docs/documentation/models.md
  - human/blockscape/documentation/docs/documentation/series.md
  - human/blockscape/documentation/docs/documentation/icons.md
  - human/blockscape/documentation/docs/documentation/value-chain.md
  - human/blockscape/documentation/docs/documentation/portfolio.md
  - human/blockscape/map-generation-prompt.md
  - human/blockscape/README.md
generated_at: 2026-07-07T12:55:00Z
user_context: "Explain the Blockscape JSON schema as a less-is-more format; icons and external links add value but are optional; series adds another dimension for exploring a domain."
tags:
  - blockscape
  - concept
  - schema
---

# JSON Schema: Less Is More

The Blockscape JSON schema is intentionally small. That is a feature, not a limitation.

A useful map can start with only a few ideas:

```json
{
  "id": "model-id",
  "title": "Model Title",
  "categories": [
    {
      "id": "category-id",
      "title": "Category Title",
      "items": [
        { "id": "item-id", "name": "Item Name" }
      ]
    }
  ]
}
```

That minimum gives the map stable identity, human-readable grouping, and named items. Everything else can be added later when the team has a reason.

## Core Fields

At model level:

- `id` gives the model a stable handle.
- `title` gives humans a readable name.
- `abstract` is optional context for the map.
- `categories` define the vertical structure.

At category level:

- `id` gives the category a stable handle.
- `title` gives the row a readable name.
- `items` contains the things being mapped.

At item level:

- `id` gives the item a stable handle.
- `name` gives humans a readable label.
- `deps` can link the item to the lower-level things it depends on.

This is enough to create value early. A team can start by naming things, grouping them, and adding dependencies only where they are known.

## Optional Extras

Blockscape supports richer fields, but they should not be treated as mandatory at the start.

`external` links an item to reference material such as documentation, a gist, a runbook, a repository, or another OKF page. When present, the UI can mark the tile with a dashed border and launch affordance. This makes a map more traceable, but an item can still be useful before its evidence link is known.

`logo` adds a small image or icon to a tile. This can help with recognition, especially for technologies or brands, but text should still lead. If the icon is not obvious or easy to source, omit it and add it later.

`color` can tint a tile to encode a local convention. It should clarify the map, not become a substitute for structure.

`stage` can represent maturity or evolution, especially for Wardley-style maps. It should be used when that meaning is explicit. If the team has not agreed on maturity, leave it out rather than pretending to know.

The less-is-more principle is: **start with stable ids, readable names, categories, and known dependencies; add decoration and metadata only when it increases shared understanding.**

## Dependencies Before Decoration

The most valuable optional field is usually `deps`, because dependencies are part of the model rather than presentation. They make relationships explicit and let the map show what visible outcomes rely on.

Even then, `deps` should be added carefully. A partial map with honest unknowns is better than a dense map full of speculative links. The generation prompt recommends clarity over exhaustiveness, short identifiers, and dependencies that reference existing item IDs.

## Categories Carry the Vertical Axis

Categories are not just folders. In Blockscape they help express the vertical value chain.

Higher categories should usually contain more visible outcomes, user-facing capabilities, or strategic concerns. Lower categories should usually contain enabling services, infrastructure, or hidden plumbing.

That means changing category order can change the meaning of the map. It is part of the model, not just formatting.

## Series Adds Another Dimension

A single Blockscape model is one view of a domain. A series is an array of models.

The source documentation is strict here: a series is an array of models, nothing more. That simplicity matters because it lets teams add another dimension without inventing a heavier format.

A series can represent:

- change over time
- multiple versions of the same system
- alternative viewpoints
- a map of maps
- slices of a domain that are too large for one readable model

This gives Blockscape a way to explore a domain beyond one static map. The first dimension is the map surface itself. The series dimension lets teams move across time, perspective, version, or scope.

## Creation Workflow

Early map creation should be cheap:

1. Name the domain.
2. Create 3-6 categories.
3. Add 2-6 items per category.
4. Keep item IDs short and stable.
5. Add known dependencies.
6. Leave uncertain fields blank.
7. Add `external`, `logo`, `color`, and `stage` later when they provide real value.

This keeps the map small enough for humans to edit and simple enough for AI to generate safely.

## Why This Matters

The schema supports the wider Blockscape thesis. If the format is too heavy, teams will not use it during real work. If it is too loose, maps cannot be validated, diffed, shared, or reused by AI tools.

Blockscape’s JSON model sits in the middle: structured enough to be durable, small enough to be created early, and flexible enough to gain value over time.

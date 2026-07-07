---
type: Concept
title: 2D Filter for the Firehose
id: blockscape-concept-two-dimensional-filter-for-firehose
status: generated
reviewed: false
source_repo: https://github.com/pwright/blockscape.git
source_commit: e98dd812f5e36f3e45f921f50369d511ccaaf88f
source_paths:
  - human/blockscape/README.md
  - human/blockscape/documentation/docs/documentation/models.md
  - human/blockscape/documentation/docs/documentation/value-chain.md
  - human/blockscape/documentation/docs/documentation/maps.md
  - human/blockscape/map-generation-prompt.md
generated_at: 2026-07-07T12:35:00Z
user_context: "Blockscape can be described as a two-dimensional filter for large volumes of messy technical information, but uncertainty is currently represented indirectly rather than as a first-class schema field."
tags:
  - blockscape
  - concept
---

# 2D Filter for the Firehose

Blockscape can act as a two-dimensional filter for technical information overload, but that claim needs careful wording.

Teams are flooded with logs, documentation, tickets, chat, meeting notes, dashboards, and AI output. A map compresses that firehose into a surface where people can inspect relationships and priority.

The current Blockscape surface is mainly:

- vertical position: visible value, user-facing need, or strategic attention
- horizontal position: maturity, evolution, or stage when that meaning is explicit
- dependency links: what each item relies on
- category ordering: a value-chain structure from visible outcomes toward enabling infrastructure

That is already useful as a filter. It helps teams see what matters, what is connected, what is more mature, what is still emerging, and what should be inspected next.

## Where the Claim Can Overreach

Blockscape does not currently have first-class schema fields for `uncertainty`, `confidence`, `risk`, or `ownership`.

Those ideas can be represented, but they are not built into the minimal JSON model in the same way as `id`, `title`, `categories`, `items`, and `deps`.

So wording like "risk versus confidence" or "visibility versus uncertainty" should be treated as a possible mapping convention, not a built-in product guarantee.

## How Blockscape Can Show Uncertainty Today

Blockscape can make uncertainty visible indirectly:

- an item can be placed leftward when it is immature, emerging, experimental, or not yet well understood
- a category can be named to preserve unknowns, assumptions, questions, risks, or unresolved areas
- an item name can make uncertainty explicit, for example "Unknown Owner", "Suspected Bottleneck", or "Unverified Dependency"
- a missing `stage`, `external`, or dependency can be left blank rather than guessed
- `color` can encode a local convention such as red for risk or grey for uncertain, if the team agrees that convention
- `external` can link to evidence, source notes, incidents, or decisions when a claim needs support
- a series can show how uncertainty changes over time or across viewpoints

This is weaker than having a formal uncertainty model, but it is honest and useful. It keeps early maps lightweight while still giving teams places to preserve uncertainty instead of hiding it in prose.

## Better Framing

A more precise claim is:

> Blockscape is a two-dimensional working surface for filtering technical noise into visible value, maturity, dependencies, and open questions.

That avoids overclaiming. It says Blockscape can help teams reason about uncertainty without pretending uncertainty is currently a fully typed axis in the core schema.

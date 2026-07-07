---
type: Concept
title: What Is a Map
id: blockscape-concept-what-is-a-map
status: generated
reviewed: false
source_repo: https://github.com/pwright/blockscape.git
source_commit: e98dd812f5e36f3e45f921f50369d511ccaaf88f
source_paths:
  - human/blockscape/README.md
generated_at: 2026-07-07T12:45:00Z
user_context: "Clarify what a map means in Blockscape, why mindmaps are not maps in the same semantic sense, and explain the horizontal and vertical axes."
tags:
  - blockscape
  - concept
---

# What Is a Map

A map is a representation where position carries meaning.

That is the key distinction. A map is not just a collection of labelled things. It places those things in a space where movement changes the claim being made.

In a road map, moving a town changes the meaning because location is part of the model. In a Wardley-style map, moving a component changes the meaning because position says something about value, visibility, maturity, or evolution. In Blockscape, moving an item should mean the team is changing its understanding of that item.

## Why Mindmaps Are Different

Mindmaps are useful, but they are not maps in the same semantic sense.

In a mindmap, the main meaning usually comes from hierarchy, grouping, and links. The exact position of a node is often a layout choice. You can move a branch from the left side to the right side to make the diagram easier to read without changing the underlying claim.

That makes mindmaps good for brainstorming and associative thinking, but weaker for calibrated system understanding. If the position does not carry a stable meaning, then moving an item does not necessarily say anything new about the system.

Blockscape is different because placement is part of the assertion. If a team moves an item, they are not just tidying the picture. They are saying something has changed in their model of value, visibility, maturity, or context.

## Horizontal Axis

The horizontal axis in Blockscape is about maturity or evolution.

Items on the left are more uncertain, emerging, bespoke, experimental, or locally specific. Items on the right are more mature, standardised, commoditised, reusable, or well understood.

Moving an item horizontally changes the claim about how evolved it is:

- leftward means more novel, immature, uncertain, or locally crafted
- rightward means more mature, repeatable, stable, or commoditised

This is useful because teams often confuse importance with maturity. A component can be extremely important and still immature. A mature component can be essential but no longer strategically interesting.

## Vertical Axis

The vertical axis in Blockscape is about visibility or value to the user, team, or system purpose.

Items higher on the map are closer to visible need, user value, or strategic attention. Items lower on the map are more foundational, enabling, infrastructural, or hidden.

Moving an item vertically changes the claim about how visible or valuable it is in the current context:

- upward means more visible, user-facing, differentiating, or directly valuable
- downward means more enabling, supporting, infrastructural, or indirectly valuable

The vertical axis is contextual. A database may be low-level infrastructure in one map and a highly visible product capability in another. The point is not universal truth. The point is shared local meaning.

## Why the Axes Matter

The axes make Blockscape more than a diagram. They turn spatial editing into model editing.

When a team moves an item, they are making a reviewable claim:

- this is more mature than we thought
- this is less mature than it appears
- this matters more to users than the AI inferred
- this is hidden infrastructure, not direct value
- this dependency is wrongly positioned for the decision we are making

That makes the map a calibrated surface for shared understanding. The map is still not the terrain, but its geometry carries meaning.

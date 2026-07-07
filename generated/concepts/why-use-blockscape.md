---
type: Concept
title: Why Use Blockscape
id: blockscape-concept-why-use-blockscape
status: generated
reviewed: false
source_repo: https://github.com/pwright/blockscape.git
source_commit: e98dd812f5e36f3e45f921f50369d511ccaaf88f
source_paths:
  - human/blockscape/README.md
generated_at: 2026-07-07T12:12:00Z
user_context: "Primary motivations supplied by Paul Wright on 2026-07-07: cheap, small, light; the map is not the terrain; more like a cross section of a machine that provides insight, like a Haynes manual."
tags:
  - blockscape
  - concept
---

# Why Use Blockscape

Blockscape is useful because it is cheap, small, and light. It does not try to become the system of record for every detail of a system. It gives people a compact model they can load, inspect, discuss, change, and share without heavy tooling or ceremony.

The map is not the terrain. A Blockscape map is not the full architecture, the full product, or the full organisation. It is closer to a cutaway drawing of a machine: a deliberate cross-section that exposes useful relationships, dependencies, and tensions while leaving out most incidental detail.

That makes it valuable for reasoning. A good Blockscape map helps someone ask better questions:

- What does this capability depend on?
- Which parts are reused by many other parts?
- Where is the system fragile, novel, or becoming commoditised?
- Which links need evidence, documentation, or a decision?
- What should a human inspect next?

The Haynes manual analogy is useful: the point is not to replace the machine, but to show enough of the machine's structure that someone can understand, diagnose, repair, or improve it. Blockscape plays a similar role for systems and architecture.

## Practical Value

Because Blockscape maps are lightweight files, they can sit beside source code, docs, prompts, and OKF pages. They are easy to regenerate, easy to diff, and easy to throw away when they stop helping.

That low cost changes the behaviour around mapping. Teams can make maps earlier, revise them more often, and use them as working notes rather than polished artefacts. The map becomes a conversation tool and an inspection aid, not a permanent claim that the whole terrain has been captured.

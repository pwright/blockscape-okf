---
title: "Blockscape Positioning"
type: BlockscapeMap
status: generated
source_path: maps/blockscape-positioning.bs
tags:
  - blockscape
---

# Blockscape Positioning

Edit: [Blockscape](https://pwright.github.io/blockscape/?load=https://raw.githubusercontent.com/pwright/blockscape-okf/refs/heads/main/maps/blockscape-positioning.bs)

```bs full
{
  "id": "blockscape-positioning",
  "title": "Blockscape Positioning",
  "abstract": "A product-positioning map for Blockscape as a shared understanding workspace: AI drafts maps, humans calibrate meaning, and durable structured artifacts support meetings, documentation, planning, debugging, and future AI work.",
  "categories": [
    {
      "id": "core-thesis",
      "title": "Core Thesis",
      "items": [
        {
          "id": "shared-understanding-workspace",
          "name": "Shared Understanding Workspace",
          "deps": ["from-summaries-to-system-models", "human-editable-map-workspace", "visual-shortcut-to-understanding", "what-is-a-map"],
          "external": "https://pwright.github.io/blockscape-okf/generated/concepts/shared-understanding-workspace"
        },
        {
          "id": "durable-model",
          "name": "Durable Model",
          "deps": ["human-editable-map-workspace", "testable-ai-generated-content", "ai-punchcards"]
        },
        {
          "id": "ai-drafts-humans-own",
          "name": "AI Drafts, Humans Own",
          "deps": ["human-editable-map-workspace", "testable-ai-generated-content"]
        }
      ]
    },
    {
      "id": "supporting-frames",
      "title": "Supporting Frames",
      "items": [
        {
          "id": "from-summaries-to-system-models",
          "name": "From Summaries to System Models",
          "deps": [],
          "external": "https://pwright.github.io/blockscape-okf/generated/concepts/from-summaries-to-system-models"
        },
        {
          "id": "visual-shortcut-to-understanding",
          "name": "Visual Shortcut to Understanding",
          "deps": [],
          "external": "https://pwright.github.io/blockscape-okf/generated/concepts/visual-shortcut-to-understanding"
        },
        {
          "id": "what-is-a-map",
          "name": "What Is a Map",
          "deps": ["visual-shortcut-to-understanding"],
          "external": "https://pwright.github.io/blockscape-okf/generated/concepts/what-is-a-map"
        },
        {
          "id": "human-editable-map-workspace",
          "name": "Human-Editable Map Workspace",
          "deps": [],
          "external": "https://pwright.github.io/blockscape-okf/generated/concepts/human-editable-map-workspace"
        },
        {
          "id": "map-as-meeting-workspace",
          "name": "Map as Meeting Workspace",
          "deps": ["human-editable-map-workspace"],
          "external": "https://pwright.github.io/blockscape-okf/generated/concepts/map-as-meeting-workspace"
        }
      ]
    },
    {
      "id": "extensions",
      "title": "Extensions",
      "items": [
        {
          "id": "two-dimensional-filter-for-firehose",
          "name": "2D Filter for the Firehose",
          "deps": ["visual-shortcut-to-understanding", "human-editable-map-workspace"],
          "external": "https://pwright.github.io/blockscape-okf/generated/concepts/two-dimensional-filter-for-firehose"
        },
        {
          "id": "testable-ai-generated-content",
          "name": "Testable AI-Generated Content",
          "deps": ["durable-model"],
          "external": "https://pwright.github.io/blockscape-okf/generated/concepts/testable-ai-generated-content"
        },
        {
          "id": "ai-punchcards",
          "name": "AI Punchcards",
          "deps": ["durable-model", "testable-ai-generated-content"],
          "external": "https://pwright.github.io/blockscape-okf/generated/concepts/ai-punchcards"
        }
      ]
    },
    {
      "id": "outcomes",
      "title": "Outcomes",
      "items": [
        { "id": "faster-orientation", "name": "Faster Orientation", "deps": ["shared-understanding-workspace", "visual-shortcut-to-understanding"] },
        { "id": "less-ceremony-more-alignment", "name": "Less Ceremony, More Alignment", "deps": ["map-as-meeting-workspace", "human-editable-map-workspace"] },
        { "id": "reusable-ai-context", "name": "Reusable AI Context", "deps": ["durable-model", "ai-punchcards"] }
      ]
    }
  ]
}
```

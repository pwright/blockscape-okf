---
title: "Docs Comms Series Test"
type: BlockscapeMap
status: generated
source_path: maps/docs-comms-series-test.bs
tags:
  - blockscape
---

# Docs Comms Series Test

Edit: [Blockscape](https://pwright.github.io/blockscape/?load=https://raw.githubusercontent.com/pwright/blockscape-okf/refs/heads/main/maps/docs-comms-series-test.bs)

```bs full
[
  {
    "id": "comms-alpha",
    "title": "Comms Alpha",
    "abstract": "Test map focused on primary channels and delivery paths.",
    "categories": [
      {
        "id": "channels",
        "title": "Channels",
        "items": [
          { "id": "alpha-email", "name": "Alpha Email", "deps": [] },
          { "id": "alpha-chat", "name": "Alpha Chat", "deps": ["alpha-email"] }
        ]
      },
      {
        "id": "delivery",
        "title": "Delivery",
        "items": [
          { "id": "alpha-smtp", "name": "Alpha SMTP", "deps": [] },
          { "id": "alpha-http", "name": "Alpha HTTP", "deps": ["alpha-smtp"] }
        ]
      }
    ]
  },
  {
    "id": "comms-beta",
    "title": "Comms Beta",
    "abstract": "Second test map sharing the channels category for overlap testing.",
    "categories": [
      {
        "id": "channels",
        "title": "Channels",
        "items": [
          { "id": "beta-email", "name": "Beta Email", "deps": [] },
          { "id": "beta-chat", "name": "Beta Chat", "deps": ["beta-email"] }
        ]
      },
      {
        "id": "support",
        "title": "Support",
        "items": [
          { "id": "beta-ticketing", "name": "Beta Ticketing", "deps": [] }
        ]
      }
    ]
  }
]
```

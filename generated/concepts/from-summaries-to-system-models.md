---
type: Concept
title: From Summaries to System Models
id: blockscape-concept-from-summaries-to-system-models
status: generated
reviewed: false
source_repo: https://github.com/pwright/blockscape.git
source_commit: e98dd812f5e36f3e45f921f50369d511ccaaf88f
source_paths:
  - human/blockscape/README.md
generated_at: 2026-07-07T12:35:00Z
user_context: "Repeated LLM summarization creates disposable prose and risks robots talking to robots."
tags:
  - blockscape
  - concept
---

# From Summaries to System Models

Repeated LLM summarization does not scale as a collaboration pattern. It encourages teams and tools to keep producing disposable prose from the same material: logs, tickets, docs, chat threads, incidents, runbooks, and prior AI summaries.

The problem is not that summaries are useless. The problem is that they are usually not durable shared knowledge. They are hard to diff, hard to test, hard to correct structurally, and easy to regenerate without improving the team model.

Blockscape shifts the output from summary text to system model:

- components become stable items
- relationships become dependencies
- maturity, value, risk, and uncertainty become editable fields
- evidence and notes can stay attached to the model
- humans and AI tools can reuse the result

The phrase to preserve is: **from summaries to system models**.

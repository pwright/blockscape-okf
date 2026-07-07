---
type: Concept
title: Testable AI-Generated Content
id: blockscape-concept-testable-ai-generated-content
status: generated
reviewed: false
source_repo: https://github.com/pwright/blockscape.git
source_commit: e98dd812f5e36f3e45f921f50369d511ccaaf88f
source_paths:
  - human/blockscape/README.md
generated_at: 2026-07-07T12:35:00Z
user_context: "Structured maps make AI-generated content easier to validate, diff, review, and test than prose."
tags:
  - blockscape
  - concept
---

# Testable AI-Generated Content

AI prose is difficult to test. Structured maps are easier.

When AI output becomes a Blockscape map, it can be checked like data:

- schema validity
- duplicate IDs
- broken dependencies
- missing required fields
- missing evidence
- unexpected changes between versions
- coverage gaps
- human approval status

That does not make AI output true by default. It makes the output reviewable. A generated map can fail validation, be corrected, be diffed, and then be approved by humans.

This is a key distinction from summarization: Blockscape turns AI output into something closer to software artifact than disposable text.

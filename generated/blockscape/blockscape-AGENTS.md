---
type: BlockscapeDocs
title: AGENTS.md
id: blockscape-AGENTS
source_file: ../human/blockscape/AGENTS.md
generated_at: 2026-07-07T11:29:03Z
generator: copy-blockscape-markdown.sh
tags:
  - blockscape
---

# AGENTS.md

**IMPORTANT**: before you do anything else, run the `/home/linuxbrew/.linuxbrew/bin/beans prime` command and heed its output.


## Overview

Svelte app in `svelte/`, rendered to static site in `docs/`, build will always overwrite `docs/`.

## Commands
- Install: npm install
- Build docs: npm run build
- Run server: npm run server

## Env
- NODE_VERSION=20

## Pitfalls
- Do not delete generated HTML; rebuild instead.

# Layout

```text
blockscape-okf/
  README.md
  plan.md
  justfile
  scripts/
    init-layout.sh
    sync-human-blockscape.sh
    copy-blockscape-markdown.sh
    copy-blockscape-maps.sh
  prompts/
    extract-from-human.md
    promote-generated.md
    generate-blockscape.md
    context-pack.md
  _system/
    AGENTS.md
  human/
    blockscape/
      _source.md
      ...snapshot of blockscape...
  sources/
    blockscape -> ../../blockscape
    blockscape.md
  generated/
    blockscape/
    maps/
  reviewed/
  indexes/
  maps/
  context-packs/
```

Each `human/<repo-name>/` source tree is intentionally copied rather than symlinked. This makes the OKF repo portable and records exactly which upstream commit was used.

`sources/blockscape` is intentionally a symlink to the sibling `../blockscape` checkout when that checkout exists. Use it for navigation and inspection; use `human/blockscape/` for snapshot-based generation.

## Test Scope

The smoke test validates the generic layout and the Blockscape source sync path using a local fixture.

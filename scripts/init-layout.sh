#!/usr/bin/env bash
set -Eeuo pipefail

log() {
  printf 'init-layout: %s\n' "$*" >&2
}

mkdir_p() {
  local dir="$1"
  mkdir -p "$dir"
  log "ensured $dir"
}

ensure_blockscape_source_link() {
  local link_path="sources/blockscape"
  local target="../../blockscape"

  if [[ -L "$link_path" ]]; then
    log "kept existing $link_path symlink"
    return
  fi

  if [[ -e "$link_path" ]]; then
    log "left existing $link_path in place"
    return
  fi

  if [[ -d "../blockscape" ]]; then
    ln -s "$target" "$link_path"
    log "linked $link_path -> $target"
  fi
}

main() {
  mkdir_p _system
  mkdir_p human
  mkdir_p human/blockscape
  mkdir_p generated/concepts
  mkdir_p generated/resources
  mkdir_p generated/workflows
  mkdir_p generated/architecture
  mkdir_p generated/blockscape
  mkdir_p generated/maps
  mkdir_p reviewed/concepts
  mkdir_p reviewed/resources
  mkdir_p reviewed/workflows
  mkdir_p reviewed/architecture
  mkdir_p indexes
  mkdir_p maps
  mkdir_p prompts
  mkdir_p sources
  mkdir_p context-packs
  ensure_blockscape_source_link

  if [[ ! -f _system/AGENTS.md ]]; then
    cat > _system/AGENTS.md <<'DOC'
# Agent rules

- Treat each `human/<repo-name>/` directory as a read-only upstream snapshot.
- Write draft OKF files to `generated/`.
- Do not write to `reviewed/` unless explicitly asked to promote reviewed content.
- Preserve source provenance in YAML front matter.
- Prefer small, traceable pages over large rewrites.
- Log non-critical progress to stderr.
DOC
    log "created _system/AGENTS.md"
  fi

  printf 'ok\n'
}

main "$@"

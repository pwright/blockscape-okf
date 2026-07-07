#!/usr/bin/env bash
set -Eeuo pipefail

source_repo="human/blockscape"
output_dir="generated/blockscape"
dry_run="false"

log() {
  printf 'copy-blockscape-markdown: %s\n' "$*" >&2
}

die() {
  printf 'copy-blockscape-markdown: ERROR: %s\n' "$*" >&2
  exit 1
}

usage() {
  cat <<'DOC'
Usage:
  copy-blockscape-markdown.sh [options]

Copy Blockscape markdown files into generated/blockscape/ with OKF front matter.

Options:
  --source-repo DIR  Source repository directory, default: human/blockscape
  --output-dir DIR   Output directory, default: generated/blockscape
  --dry-run          Show what would happen without modifying files
  -h, --help         Show help
DOC
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --source-repo)
      source_repo="${2:-}"
      shift 2
      ;;
    --output-dir)
      output_dir="${2:-}"
      shift 2
      ;;
    --dry-run)
      dry_run="true"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      die "unknown argument: $1"
      ;;
  esac
done

[[ -n "$source_repo" ]] || die "--source-repo must not be empty"
[[ -n "$output_dir" ]] || die "--output-dir must not be empty"
[[ -d "$source_repo" ]] || die "source repository not found: $source_repo (run sync-human-blockscape.sh first)"

if [[ "$dry_run" == "true" ]]; then
  log "dry run enabled; no files changed"
  printf 'dry-run\n'
  exit 0
fi

generated_at="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
mkdir -p "$output_dir"
find "$output_dir" -maxdepth 1 -type f -name "*.md" -delete

copied_count=0

while IFS= read -r -d '' md_file; do
  if [[ "$(basename "$md_file")" == "_source.md" ]]; then
    continue
  fi

  relative_path="${md_file#$source_repo/}"
  output_name="blockscape-$(echo "$relative_path" | tr '/' '-')"
  title=$(grep -m 1 '^# ' "$md_file" 2>/dev/null | sed 's/^# //' || true)

  if [[ -z "$title" ]]; then
    title=$(basename "$md_file" .md | tr '-' ' ' | sed 's/\b\(.\)/\u\1/g')
  fi

  id="${output_name%.md}"

  cat > "${output_dir}/${output_name}" <<DOC
---
type: BlockscapeDocs
title: $title
id: $id
source_file: ../$md_file
generated_at: $generated_at
generator: copy-blockscape-markdown.sh
tags:
  - blockscape
---

DOC

  cat "$md_file" >> "${output_dir}/${output_name}"

  log "wrote ${output_dir}/${output_name}"
  : $((copied_count++))
done < <(find "$source_repo" \
  -path "$source_repo/.beans" -prune -o \
  -path "$source_repo/.devin" -prune -o \
  -path "$source_repo/node_modules" -prune -o \
  -path "$source_repo/docs/assets" -prune -o \
  -path "$source_repo/docs/data.log" -prune -o \
  -path "$source_repo/cypress" -prune -o \
  -name "*.md" -type f -print0)

if [[ $copied_count -eq 0 ]]; then
  log "warning: no markdown files found"
  printf 'no-files-copied\n'
else
  log "copied $copied_count markdown files"
  printf 'success\n'
fi

#!/usr/bin/env bash
set -Eeuo pipefail

source_repo="human/blockscape"
output_dir="maps"
dry_run="false"

log() {
  printf 'copy-blockscape-maps: %s\n' "$*" >&2
}

die() {
  printf 'copy-blockscape-maps: ERROR: %s\n' "$*" >&2
  exit 1
}

usage() {
  cat <<'DOC'
Usage:
  copy-blockscape-maps.sh [options]

Copy Blockscape .bs files from the source snapshot into maps/.

Options:
  --source-repo DIR  Source repository directory, default: human/blockscape
  --output-dir DIR   Output directory, default: maps
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

mkdir -p "$output_dir"
find "$output_dir" -maxdepth 1 -type f \( -name "*.bs" -o -name "*.json" \) -delete
copied_count=0
json_count=0

is_valid_blockscape_payload() {
  local map_file="$1"
  python3 - "$map_file" <<'PY'
import json
import sys
from pathlib import Path


def valid_map(value):
    if not isinstance(value, dict):
        return False
    if not isinstance(value.get("id"), str) or not value["id"].strip():
        return False
    if not isinstance(value.get("title"), str) or not value["title"].strip():
        return False
    categories = value.get("categories")
    if not isinstance(categories, list):
        return False
    for category in categories:
        if not isinstance(category, dict):
            return False
        if not isinstance(category.get("id"), str) or not category["id"].strip():
            return False
        if not isinstance(category.get("title"), str) or not category["title"].strip():
            return False
        items = category.get("items")
        if not isinstance(items, list):
            return False
        for item in items:
            if not isinstance(item, dict):
                return False
            if not isinstance(item.get("id"), str) or not item["id"].strip():
                return False
            if not isinstance(item.get("name"), str) or not item["name"].strip():
                return False
    return True


try:
    payload = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
except Exception:
    raise SystemExit(1)

if isinstance(payload, list):
    raise SystemExit(0 if payload and all(valid_map(item) for item in payload) else 1)

raise SystemExit(0 if valid_map(payload) else 1)
PY
}

copy_map() {
  local map_file="$1"
  relative_path="${map_file#$source_repo/}"
  output_name="$(echo "$relative_path" | tr '/' '-' | sed 's/^-//')"
  if ! is_valid_blockscape_payload "$map_file"; then
    output_name="${output_name%.bs}.json"
    : $((json_count++))
  fi
  cp "$map_file" "$output_dir/$output_name"
  log "wrote $output_dir/$output_name"
  : $((copied_count++))
}

if [[ -d "$source_repo/docs" ]]; then
  while IFS= read -r -d '' map_file; do
    copy_map "$map_file"
  done < <(find "$source_repo/docs" -maxdepth 1 -name "*.bs" -type f -print0)
fi

if [[ -d "$source_repo/blockscape-data" ]]; then
  while IFS= read -r -d '' map_file; do
    copy_map "$map_file"
  done < <(find "$source_repo/blockscape-data" -maxdepth 1 -name "*.bs" -type f -print0)
fi

while IFS= read -r -d '' map_file; do
  copy_map "$map_file"
done < <(find "$source_repo" -maxdepth 1 -name "*.bs" -type f -print0)

if [[ $copied_count -eq 0 ]]; then
  log "warning: no Blockscape maps found"
  printf 'no-maps-copied\n'
else
  log "copied $copied_count Blockscape maps"
  if [[ $json_count -gt 0 ]]; then
    log "renamed $json_count invalid Blockscape payloads to .json"
  fi
  printf 'success\n'
fi

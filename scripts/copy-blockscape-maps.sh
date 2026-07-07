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
find "$output_dir" -maxdepth 1 -type f -name "*.bs" -delete
copied_count=0

copy_map() {
  local map_file="$1"
  relative_path="${map_file#$source_repo/}"
  output_name="$(echo "$relative_path" | tr '/' '-' | sed 's/^-//')"
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
  printf 'success\n'
fi

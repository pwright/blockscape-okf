#!/usr/bin/env bash
set -Eeuo pipefail

repo_url="https://github.com/pwright/blockscape.git"
branch="main"
dest="human/blockscape"
sources_dir="sources"
dry_run="false"
local_source=""

log() {
  printf 'sync-human-blockscape: %s\n' "$*" >&2
}

die() {
  printf 'sync-human-blockscape: ERROR: %s\n' "$*" >&2
  exit 1
}

usage() {
  cat <<'DOC'
Usage:
  sync-human-blockscape.sh [options]

Clone or copy the Blockscape repository into human/blockscape/.
If ../blockscape exists, it is used as the default local source so this OKF
repo can be initialized beside the app repo without network access.

Options:
  --repo URL          Git repository URL, default: https://github.com/pwright/blockscape.git
  --branch NAME      Branch to fetch, default: main
  --dest DIR         Destination directory, default: human/blockscape
  --sources-dir DIR  Provenance directory, default: sources
  --local-source DIR Copy from a local directory instead of cloning
  --dry-run          Show what would happen without modifying files
  -h, --help         Show help

Stdout:
  Prints the resolved source commit, or 'local-fixture' for non-git fixtures.
DOC
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo)
      repo_url="${2:-}"
      shift 2
      ;;
    --branch)
      branch="${2:-}"
      shift 2
      ;;
    --dest)
      dest="${2:-}"
      shift 2
      ;;
    --sources-dir)
      sources_dir="${2:-}"
      shift 2
      ;;
    --local-source)
      local_source="${2:-}"
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

[[ -n "$repo_url" ]] || die "--repo must not be empty"
[[ -n "$branch" ]] || die "--branch must not be empty"
[[ -n "$dest" ]] || die "--dest must not be empty"
[[ -n "$sources_dir" ]] || die "--sources-dir must not be empty"

case "$dest" in
  /|.|..|human|"" )
    die "refusing unsafe destination: $dest"
    ;;
esac

command -v rsync >/dev/null 2>&1 || die "rsync is required"

if [[ -z "$local_source" && -d "../blockscape" ]]; then
  local_source="../blockscape"
fi

log "repo: $repo_url"
log "branch: $branch"
log "destination: $dest"

if [[ "$dry_run" == "true" ]]; then
  log "dry run enabled; no files changed"
  printf 'dry-run\n'
  exit 0
fi

tmp_dir="$(mktemp -d)"
cleanup() {
  rm -rf "$tmp_dir"
}
trap cleanup EXIT

source_dir=""
commit=""

if [[ -n "$local_source" ]]; then
  [[ -d "$local_source" ]] || die "local source does not exist: $local_source"
  source_dir="$local_source"
  if git -C "$local_source" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    commit="$(git -C "$local_source" rev-parse HEAD)"
  else
    commit="local-fixture"
  fi
  log "using local source: $local_source"
else
  command -v git >/dev/null 2>&1 || die "git is required when --local-source is not used"
  source_dir="$tmp_dir/blockscape"
  log "cloning shallow copy"
  git clone --depth 1 --branch "$branch" "$repo_url" "$source_dir" >&2
  commit="$(git -C "$source_dir" rev-parse HEAD)"
fi

retrieved_at="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

log "resolved commit: $commit"
mkdir -p "$dest" "$sources_dir"

log "syncing snapshot into $dest"
rsync -a --delete \
  --exclude ".git" \
  --exclude "node_modules" \
  --exclude "docs/assets" \
  --exclude "docs/data.log" \
  --exclude "cypress/videos" \
  "$source_dir/" "$dest/"

cat > "$dest/_source.md" <<DOC
---
type: SourceSnapshot
title: Blockscape source snapshot
source_repo: $repo_url
source_branch: $branch
source_commit: $commit
retrieved_at: $retrieved_at
status: human-source-snapshot
---

# Blockscape source snapshot

This directory is a copied snapshot of the Blockscape repository.

Do not edit this directory directly. Refresh it with:

\`\`\`bash
./scripts/sync-human-blockscape.sh
\`\`\`
DOC

cat > "$sources_dir/blockscape.md" <<DOC
---
type: SourceRepository
title: Blockscape
id: source-blockscape
repo: $repo_url
branch: $branch
commit: $commit
retrieved_at: $retrieved_at
local_snapshot: ../$dest
---

# Blockscape

This source entry records the commit used to populate \`$dest/\`.

- Repository: \`$repo_url\`
- Branch: \`$branch\`
- Commit: \`$commit\`
- Retrieved: \`$retrieved_at\`
- Local snapshot: \`../$dest\`
DOC

log "wrote $dest/_source.md"
log "wrote $sources_dir/blockscape.md"
printf '%s\n' "$commit"

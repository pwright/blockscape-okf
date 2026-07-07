#!/usr/bin/env bash
set -Eeuo pipefail

log() {
  printf 'smoke-test: %s\n' "$*" >&2
}

die() {
  printf 'smoke-test: ERROR: %s\n' "$*" >&2
  exit 1
}

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
work_dir="$(mktemp -d)"
trap 'rm -rf "$work_dir"' EXIT

log "copying project to temporary directory"
rsync -a --exclude human --exclude generated --exclude reviewed --exclude indexes --exclude maps "$repo_root/" "$work_dir/project/"
cd "$work_dir/project"

log "initializing layout"
./scripts/init-layout.sh >/tmp/blockscape-okf-init.out

log "syncing from offline fixture"
commit="$(./scripts/sync-human-blockscape.sh --local-source tests/fixtures/fake-blockscape)"
[[ "$commit" == "local-fixture" || "$commit" =~ ^[0-9a-f]{40}$ ]] || die "unexpected fixture commit: $commit"

[[ -f human/blockscape/_source.md ]] || die "missing human/blockscape/_source.md"
[[ -f sources/blockscape.md ]] || die "missing sources/blockscape.md"
[[ -f human/blockscape/docs/fixture.md ]] || die "missing copied fixture page"

grep -Eq 'source_commit: local-fixture|source_commit: [0-9a-f]{40}' human/blockscape/_source.md || die "human source metadata missing commit"
grep -q 'local_snapshot: ../human/blockscape' sources/blockscape.md || die "source record missing snapshot path"

log "copying generated markdown and maps"
./scripts/copy-blockscape-markdown.sh >/tmp/blockscape-okf-markdown.out
./scripts/copy-blockscape-maps.sh >/tmp/blockscape-okf-maps.out
./tools/update-generated-maps.py --input maps --output generated/maps >/tmp/blockscape-okf-generated-maps.out

[[ -f generated/blockscape/blockscape-docs-fixture.md ]] || die "missing generated markdown"
[[ -f maps/docs-fixture.bs ]] || die "missing copied map"
[[ -f generated/maps/docs-fixture.md ]] || die "missing generated map page"

log "checking expected directories"
while IFS= read -r dir; do
  [[ -d "$dir" ]] || die "missing directory: $dir"
done < tests/golden/expected-layout.txt

log "ok"
printf 'ok\n'

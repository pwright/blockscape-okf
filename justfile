set shell := ["bash", "-eu", "-o", "pipefail", "-c"]

okf_base_url := "https://pwright.github.io/blockscape-okf/"
okf_raw_base_url := "https://raw.githubusercontent.com/pwright/blockscape-okf/refs/heads/main/"
blockscape_app_base_url := "https://pwright.github.io/blockscape/"

# List available commands
_default:
    just --list

# Create directories and fetch configured human source snapshots
init:
    ./scripts/init-layout.sh
    ./scripts/sync-human-blockscape.sh
    ./scripts/copy-blockscape-markdown.sh
    ./scripts/copy-blockscape-maps.sh
    just maps

# Create directories only
layout:
    ./scripts/init-layout.sh

# Refresh all configured human source snapshots
sync-human:
    ./scripts/sync-human-blockscape.sh
    ./scripts/copy-blockscape-markdown.sh
    ./scripts/copy-blockscape-maps.sh

# Dry-run all human source sync and extraction scripts
sync-human-dry-run:
    ./scripts/sync-human-blockscape.sh --dry-run
    ./scripts/copy-blockscape-markdown.sh --dry-run
    ./scripts/copy-blockscape-maps.sh --dry-run

# Refresh human/blockscape/ from the Blockscape repo
sync-human-blockscape:
    ./scripts/sync-human-blockscape.sh

# Copy markdown files from human/blockscape/ to generated/blockscape/
copy-blockscape-markdown:
    ./scripts/copy-blockscape-markdown.sh

# Copy .bs maps from human/blockscape/ to maps/
copy-blockscape-maps:
    ./scripts/copy-blockscape-maps.sh

# Build an offline test fixture and validate behavior without network
test:
    ./tests/smoke-test.sh

# Print unique tags from Markdown front matter
tags *paths:
    @./scripts/extract-frontmatter-tags.py {{paths}}

# Wrap Blockscape maps as generated Markdown pages
maps:
    ./tools/update-generated-maps.py --input maps --output generated/maps --source-base-url {{okf_raw_base_url}} --blockscape-base-url {{blockscape_app_base_url}}

# Stage publishable OKF content into Quartz
quartz-stage: maps
    python3 tools/stage-quartz-content.py --input generated --input reviewed --input sources --output quartz/content --link-map linkmap.yaml

# Build the Quartz static site
quartz-build: quartz-stage
    ./tools/update-generated-maps.py --input maps --output generated/maps --source-base-url {{okf_raw_base_url}} --blockscape-base-url {{blockscape_app_base_url}}

    cd quartz && node quartz/bootstrap-cli.mjs build

# Serve the Quartz site locally
quartz-serve: quartz-stage
    ./tools/update-generated-maps.py --input maps --output generated/maps --source-base-url {{okf_raw_base_url}} --blockscape-base-url {{blockscape_app_base_url}}

    cd quartz && node quartz/bootstrap-cli.mjs build --serve

# Remove Quartz staged content and build output
quartz-clean:
    rm -rf quartz/content
    mkdir -p quartz/content
    touch quartz/content/.gitkeep
    rm -rf quartz/public

# Print the expected tree for the MVP
show-expected-layout:
    cat tests/golden/expected-layout.txt

# Print current top-level tree without requiring tree(1)
tree:
    find . -maxdepth 3 -type d -print | sort

# Print the base URL used for published OKF links
okf-base-url:
    @echo {{okf_base_url}}

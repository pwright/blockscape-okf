#!/usr/bin/env python3
"""Stage OKF wiki content for Quartz.

The repository's source-of-truth directories remain outside Quartz. This script
copies publishable directories into quartz/content and rewrites references to
human source snapshots into public URLs.
"""

from __future__ import annotations

import argparse
import re
import shutil
import sys
from pathlib import Path
from urllib.parse import quote


TEXT_EXTENSIONS = {
    ".md",
    ".mdx",
    ".txt",
    ".yaml",
    ".yml",
    ".json",
    ".csv",
    ".base",
    ".svg",
}


def log(message: str) -> None:
    print(f"stage-quartz-content: {message}", file=sys.stderr)


def parse_linkmap(path: Path) -> list[dict[str, object]]:
    if not path.exists():
        raise SystemExit(f"link map not found: {path}")

    repos: list[dict[str, object]] = []
    current: dict[str, object] | None = None
    active_list: str | None = None

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        if not raw_line.strip() or raw_line.lstrip().startswith("#"):
            continue

        indent = len(raw_line) - len(raw_line.lstrip(" "))
        line = raw_line.strip()

        if indent == 2 and line.endswith(":"):
            current = {"name": line[:-1], "local_prefixes": [], "strip_prefixes": []}
            repos.append(current)
            active_list = None
            continue

        if current is None:
            continue

        if indent == 4 and line.endswith(":"):
            active_list = line[:-1]
            current.setdefault(active_list, [])
            continue

        if indent == 6 and line.startswith("- ") and active_list:
            value = line[2:].strip()
            current.setdefault(active_list, [])
            current[active_list].append(value)  # type: ignore[index, union-attr]
            continue

        if indent == 4 and ":" in line:
            key, value = line.split(":", 1)
            current[key.strip()] = value.strip()
            active_list = None

    for repo in repos:
        if not repo.get("public_base_url"):
            raise SystemExit(f"link map entry missing public_base_url: {repo.get('name')}")
        if not repo.get("local_prefixes"):
            raise SystemExit(f"link map entry missing local_prefixes: {repo.get('name')}")

    return repos


def rewrite_target(rest: str, repo: dict[str, object]) -> str:
    target = rest
    anchor = ""
    if "#" in target:
        target, anchor = target.split("#", 1)
        anchor = "#" + anchor

    for strip_prefix in repo.get("strip_prefixes", []):
        if target.startswith(strip_prefix):
            target = target[len(strip_prefix) :]
            break

    extension = repo.get("markdown_extension")
    if extension and target.endswith(".md"):
        target = target[:-3] + "." + str(extension).lstrip(".")

    quoted = quote(target, safe="/._-~")
    return str(repo["public_base_url"]).rstrip("/") + "/" + quoted + anchor


def rewrite_human_links(text: str, repos: list[dict[str, object]]) -> str:
    updated = text
    for repo in repos:
        for prefix in repo.get("local_prefixes", []):
            escaped = re.escape(str(prefix))
            pattern = re.compile(rf"(?<![\w./-]){escaped}([^\s)>\]`\"']+)")

            def replace(match: re.Match[str]) -> str:
                return rewrite_target(match.group(1), repo)

            updated = pattern.sub(replace, updated)
    return updated


def copy_tree(input_dir: Path, output_dir: Path, repos: list[dict[str, object]]) -> int:
    copied = 0
    stage_root = output_dir / input_dir.name
    stage_root.mkdir(parents=True, exist_ok=True)

    for source in sorted(input_dir.rglob("*")):
        if source.is_dir():
            continue
        if source.name == ".gitkeep":
            continue

        relative = source.relative_to(input_dir)
        target = stage_root / relative
        target.parent.mkdir(parents=True, exist_ok=True)

        if source.suffix.lower() in TEXT_EXTENSIONS:
            text = source.read_text(encoding="utf-8")
            target.write_text(rewrite_human_links(text, repos), encoding="utf-8")
        else:
            shutil.copy2(source, target)
        copied += 1

    return copied


def reset_output(output_dir: Path) -> None:
    if output_dir.exists():
        shutil.rmtree(output_dir)
    output_dir.mkdir(parents=True)
    (output_dir / ".gitkeep").write_text("", encoding="utf-8")


def write_homepage(output_dir: Path) -> None:
    (output_dir / "index.md").write_text(
        """---
title: Blockscape OKF
status: generated
reviewed: false
---

# Blockscape OKF

This site publishes staged OKF wiki pages from the repository's generated and reviewed knowledge layers.

## Published areas

### Generated notes
- [Blockscape](generated/blockscape/)
- [Concepts](generated/concepts/)
- [Maps](generated/maps/)
- [Workflows](generated/workflows/)

### Reviewed notes
- [Reviewed](reviewed/)

### Source snapshots
- [Sources](sources/)
""",
        encoding="utf-8",
    )


def copy_templates(template_dir: Path, output_dir: Path, repos: list[dict[str, object]]) -> int:
    if not template_dir.exists():
        log(f"no templates directory found at {template_dir}, skipping")
        return 0

    copied = 0
    for source in sorted(template_dir.glob("*.base")):
        if not source.is_file():
            continue

        target = output_dir / source.name
        text = source.read_text(encoding="utf-8")
        target.write_text(rewrite_human_links(text, repos), encoding="utf-8")
        copied += 1

    return copied


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--input",
        action="append",
        dest="inputs",
        default=[],
        help="Publish source directory. May be repeated.",
    )
    parser.add_argument("--output", required=True, help="Quartz content staging directory.")
    parser.add_argument("--link-map", required=True, help="YAML link map for human source URLs.")
    args = parser.parse_args()

    inputs = [Path(value) for value in args.inputs]
    if not inputs:
        raise SystemExit("at least one --input directory is required")

    output_dir = Path(args.output)
    repos = parse_linkmap(Path(args.link_map))

    reset_output(output_dir)
    write_homepage(output_dir)

    # Copy template files (e.g., .base files for Obsidian Dataview)
    template_dir = output_dir.parent / "templates"
    template_count = copy_templates(template_dir, output_dir, repos)
    if template_count > 0:
        log(f"copied {template_count} template files from {template_dir}")

    total = 0
    for input_dir in inputs:
        if not input_dir.exists():
            log(f"skipping missing input: {input_dir}")
            continue
        if not input_dir.is_dir():
            raise SystemExit(f"input is not a directory: {input_dir}")
        copied = copy_tree(input_dir, output_dir, repos)
        log(f"copied {copied} files from {input_dir}")
        total += copied

    # Copy images from input/images/ to root images/ for Quartz URL resolution
    input_images_src = output_dir / "input" / "images"
    if input_images_src.exists():
        images_dest = output_dir / "images"
        if images_dest.exists():
            shutil.rmtree(images_dest)
        shutil.copytree(input_images_src, images_dest)
        image_count = sum(1 for _ in images_dest.rglob("*") if _.is_file())
        log(f"copied {image_count} images from input/images/ to root images/")

    log(f"staged {total} files in {output_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""Wrap Blockscape .bs files as generated Markdown pages."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


DEFAULT_ARRAY_TITLES = {
    "blockscape": "Blockscape",
}

DEFAULT_SOURCE_BASE_URL = "https://raw.githubusercontent.com/pwright/blockscape-okf/refs/heads/main/"
DEFAULT_BLOCKSCAPE_BASE_URL = "https://pwright.github.io/blockscape/"


def page_title(path: Path, data: object) -> str:
    if isinstance(data, dict) and isinstance(data.get("title"), str):
        return data["title"]

    return DEFAULT_ARRAY_TITLES.get(
        path.stem,
        path.stem.replace("-", " ").replace("_", " ").title(),
    )


def source_url(base_url: str, source: Path) -> str:
    return base_url.rstrip("/") + "/" + source.as_posix()


def edit_url(blockscape_base_url: str, raw_source_url: str) -> str:
    return blockscape_base_url.rstrip("/") + "/?load=" + raw_source_url


def is_blockscape_map(value: object) -> bool:
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


def is_blockscape_payload(value: object) -> bool:
    if isinstance(value, list):
        return bool(value) and all(is_blockscape_map(item) for item in value)
    return is_blockscape_map(value)


def render_page(source: Path, source_base_url: str, blockscape_base_url: str) -> str:
    raw = source.read_text(encoding="utf-8").rstrip()
    is_valid_blockscape = True
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        print(f"warning: {source} is not a single JSON document: {exc}", file=sys.stderr)
        data = None
        is_valid_blockscape = False
    else:
        is_valid_blockscape = is_blockscape_payload(data)
        if not is_valid_blockscape:
            print(f"warning: {source} is not a valid Blockscape map payload", file=sys.stderr)
    title = page_title(source, data)
    raw_url = source_url(source_base_url, source)
    blockscape_url = edit_url(blockscape_base_url, raw_url)
    fence = "bs full" if is_valid_blockscape else "text"

    return "\n".join(
        [
            "---",
            f'title: "{title}"',
            "type: BlockscapeMap",
            "status: generated",
            f"source_path: {source.as_posix()}",
            "tags:",
            "  - blockscape",
            "---",
            "",
            f"# {title}",
            "",
            f"Edit: [Blockscape]({blockscape_url})",
            "",
            f"```{fence}",
            raw,
            "```",
            "",
        ]
    )


def update_maps(
    input_root: Path,
    output_root: Path,
    source_base_url: str,
    blockscape_base_url: str,
) -> None:
    output_root.mkdir(parents=True, exist_ok=True)
    for stale in output_root.glob("*.md"):
        stale.unlink()

    for source in sorted(input_root.glob("*.bs")):
        output = output_root / f"{source.stem}.md"
        output.write_text(
            render_page(source, source_base_url, blockscape_base_url),
            encoding="utf-8",
        )
        print(output.as_posix())


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, default=Path("maps"))
    parser.add_argument("--output", type=Path, default=Path("generated/maps"))
    parser.add_argument("--source-base-url", default=DEFAULT_SOURCE_BASE_URL)
    parser.add_argument("--blockscape-base-url", default=DEFAULT_BLOCKSCAPE_BASE_URL)
    args = parser.parse_args()

    update_maps(
        args.input,
        args.output,
        args.source_base_url,
        args.blockscape_base_url,
    )


if __name__ == "__main__":
    main()

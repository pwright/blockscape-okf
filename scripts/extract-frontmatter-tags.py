#!/usr/bin/env python3
import argparse
import ast
import pathlib
import sys


def iter_markdown_files(paths):
    for raw_path in paths:
        path = pathlib.Path(raw_path)
        if path.is_dir():
            yield from sorted(path.rglob("*.md"))
        elif path.is_file() and path.suffix == ".md":
            yield path


def frontmatter_lines(path):
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except UnicodeDecodeError:
        lines = path.read_text().splitlines()

    if not lines or lines[0].strip() != "---":
        return []

    for index, line in enumerate(lines[1:], start=1):
        if line.strip() == "---":
            return lines[1:index]

    return []


def parse_inline_list(value):
    value = value.strip()
    if not (value.startswith("[") and value.endswith("]")):
        return []

    try:
        parsed = ast.literal_eval(value)
    except (SyntaxError, ValueError):
        parsed = [item.strip() for item in value.strip("[]").split(",")]

    if not isinstance(parsed, list):
        return []

    return [str(item).strip().strip("'\"") for item in parsed if str(item).strip()]


def tags_from_frontmatter(lines):
    tags = []
    in_tags = False
    tag_indent = 0

    for line in lines:
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue

        if in_tags:
            indent = len(line) - len(line.lstrip(" "))
            if indent <= tag_indent and not stripped.startswith("- "):
                in_tags = False
            elif stripped.startswith("- "):
                tag = stripped[2:].strip().strip("'\"")
                if tag:
                    tags.append(tag)
                continue

        if stripped.startswith("tags:"):
            tag_indent = len(line) - len(line.lstrip(" "))
            value = stripped[len("tags:"):].strip()
            if value:
                tags.extend(parse_inline_list(value))
                in_tags = False
            else:
                in_tags = True

    return tags


def main():
    parser = argparse.ArgumentParser(
        description="Extract unique tags from Markdown YAML front matter."
    )
    parser.add_argument(
        "paths",
        nargs="*",
        default=["generated", "reviewed"],
        help="Markdown files or directories to scan. Defaults to generated reviewed.",
    )
    args = parser.parse_args()

    tags = set()
    for path in iter_markdown_files(args.paths):
        for tag in tags_from_frontmatter(frontmatter_lines(path)):
            tags.add(tag)

    for tag in sorted(tags):
        print(tag)

    return 0


if __name__ == "__main__":
    sys.exit(main())

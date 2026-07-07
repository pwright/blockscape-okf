import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  buildModelIndex,
  extractSubgraph,
  filterCategory,
  findDependents,
  getItem,
  listItems,
  validateModel,
} from "../src/blockscapeModel";
import { defaultSeed } from "../src/defaultSeed";

function loadBundledMap(filename) {
  const raw = readFileSync(new URL(`../public/${filename}`, import.meta.url), "utf8");
  return JSON.parse(raw);
}

describe("bundled default maps", () => {
  it("validates the inlined default seed map", () => {
    const validation = validateModel(defaultSeed);

    expect(validation.ok).toBe(true);
    expect(defaultSeed.id).toBe("blockscape");
    expect(defaultSeed.title).toBe("Blockscape (AI maps)");
    expect(defaultSeed.categories).toHaveLength(4);
    expect(listItems(defaultSeed)).toHaveLength(17);
  });

  it("supports helper queries against the default seed map", () => {
    expect(getItem(defaultSeed, "bs-format-simple")?.name).toBe("BS Schema");

    expect(
      findDependents(defaultSeed, "bs-format-simple")
        .map((item) => item.id)
        .sort()
    ).toEqual([
      "abstract-gist-loading",
      "create-gist-multidoc",
      "editor-human-terms",
      "llm-consume-bs",
      "llm-generate-bs",
      "load-multidoc-file",
      "model-collection",
      "paste-bs-file",
    ]);

    const filtered = filterCategory(defaultSeed, "experience");
    expect(filtered?.title).toBe(defaultSeed.title);
    expect(filtered?.categories).toHaveLength(1);
    expect(filtered?.categories[0]?.id).toBe("experience");

    const subgraph = extractSubgraph(defaultSeed, "bs-format-simple");
    expect(validateModel(subgraph).ok).toBe(true);
    expect(listItems(subgraph).map((item) => item.id).sort()).toEqual([
      "abstract-gist-loading",
      "bs-format-simple",
      "create-gist-multidoc",
      "editor-human-terms",
      "llm-consume-bs",
      "llm-generate-bs",
      "load-multidoc-file",
      "model-collection",
      "paste-bs-file",
    ]);
  });

  it("validates the bundled Blockscape sample catalog map", () => {
    const catalog = loadBundledMap("models.bs");
    const validation = validateModel(catalog);

    expect(validation.ok).toBe(true);
    expect(catalog.id).toBe("models-catalog");
    expect(catalog.title).toBe("Blockscape Sample Catalog");
    expect(catalog.categories.map((category) => category.id)).toEqual([
      "public-samples",
      "it",
      "blockscape",
    ]);
    expect(listItems(catalog)).toHaveLength(14);
  });

  it("supports helper queries against the sample catalog", () => {
    const catalog = loadBundledMap("models.bs");
    const items = listItems(catalog);

    expect(getItem(catalog, "planets")?.external).toBe("?load=planets.bs");
    expect(findDependents(catalog, "planets")).toEqual([]);

    const filtered = filterCategory(catalog, "blockscape");
    expect(filtered?.title).toBe(catalog.title);
    expect(filtered?.categories).toHaveLength(1);
    expect(filtered?.categories[0]?.items.map((item) => item.id)).toEqual([
      "blockscape-features",
      "wardley",
      "styleguide",
    ]);

    expect(items.every((item) => item.external?.startsWith("?load="))).toBe(true);

    const index = buildModelIndex(catalog);
    expect(index.seen.size).toBe(items.length);
    expect(index.reusedLocal.size).toBe(0);
  });
});

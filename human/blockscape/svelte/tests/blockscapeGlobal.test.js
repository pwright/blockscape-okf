import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

import { defaultSeed } from "../src/defaultSeed";
import {
  cloneGlobalRegistry,
  collectMapItemIds,
  createGlobalRegistry,
  extractSubgraph,
  findDependents,
  interleave,
  materialize,
  mergeItem,
  normalizeInto,
} from "../src/blockscapeGlobal";

function createModel() {
  return {
    id: "test-model",
    title: "Test Model",
    abstract: "<p>Summary</p>",
    backgroundUrl: "https://example.com/bg.png",
    categories: [
      {
        id: "experience",
        title: "Experience",
        items: [
          {
            id: "frontend",
            name: "Frontend",
            deps: ["api"],
            color: "#2563eb",
            stage: 2,
          },
        ],
      },
      {
        id: "platform",
        title: "Platform",
        items: [
          {
            id: "api",
            name: "API",
            deps: ["db"],
            logo: "./logos/api.svg",
          },
          {
            id: "db",
            name: "Database",
            deps: [],
            external: "https://example.com/db",
          },
          {
            id: "cache",
            name: "Cache",
            deps: ["db"],
          },
        ],
      },
    ],
  };
}

function loadBundledMap(filename) {
  const raw = readFileSync(new URL(`../public/${filename}`, import.meta.url), "utf8");
  return JSON.parse(raw);
}

describe("blockscapeGlobal", () => {
  it("merges items without losing dependency information", () => {
    const logger = vi.fn();
    const merged = mergeItem(
      {
        id: "api",
        name: "API",
        deps: ["db"],
        logo: "./logos/api.svg",
      },
      {
        id: "api",
        name: "API v2",
        deps: ["db", "cache"],
        external: "https://example.com/api",
      },
      { logger }
    );

    expect(merged).toEqual({
      id: "api",
      name: "API",
      deps: ["db", "cache"],
      logo: "./logos/api.svg",
      external: "https://example.com/api",
    });
    expect(logger).toHaveBeenCalled();
  });

  it("normalizes and materializes a map without changing its visible shape", () => {
    const base = createGlobalRegistry();
    const normalized = normalizeInto(base, createModel(), { mapId: "map-1" });
    const roundTripped = materialize(normalized, "map-1");

    expect(Object.keys(normalized.items).sort()).toEqual([
      "api",
      "cache",
      "db",
      "frontend",
    ]);
    expect(collectMapItemIds(normalized, "map-1")).toEqual([
      "frontend",
      "api",
      "db",
      "cache",
    ]);
    expect(roundTripped).toEqual(createModel());
  });

  it("updates an existing normalized map when items are added later", () => {
    let globalRegistry = normalizeInto(createGlobalRegistry(), createModel(), {
      mapId: "map-1",
    });
    const edited = createModel();
    edited.categories[0].items.push({
      id: "worker",
      name: "Worker",
      deps: ["api"],
    });

    globalRegistry = normalizeInto(globalRegistry, edited, { mapId: "map-1" });

    const roundTripped = materialize(globalRegistry, "map-1");
    expect(roundTripped.categories[0].items.map((item) => item.id)).toEqual([
      "frontend",
      "worker",
    ]);
  });

  it("updates an existing normalized map when items move between categories", () => {
    let globalRegistry = normalizeInto(createGlobalRegistry(), createModel(), {
      mapId: "map-1",
    });
    const edited = createModel();
    const [frontend] = edited.categories[0].items.splice(0, 1);
    edited.categories[1].items.splice(1, 0, frontend);

    globalRegistry = normalizeInto(globalRegistry, edited, { mapId: "map-1" });

    const roundTripped = materialize(globalRegistry, "map-1");
    expect(roundTripped.categories[0].items).toEqual([]);
    expect(roundTripped.categories[1].items.map((item) => item.id)).toEqual([
      "api",
      "frontend",
      "db",
      "cache",
    ]);
  });

  it("supports graph helpers over the normalized registry", () => {
    const globalRegistry = normalizeInto(createGlobalRegistry(), createModel(), {
      mapId: "map-1",
    });

    expect(findDependents(globalRegistry, "db").map((item) => item.id).sort()).toEqual([
      "api",
      "cache",
    ]);

    expect(extractSubgraph(globalRegistry, ["frontend"]).categories[0].items.map((item) => item.id)).toEqual([
      "frontend",
      "api",
      "db",
    ]);
  });

  it("interleaves bundled maps and includes transitive dependencies", () => {
    let globalRegistry = createGlobalRegistry();
    globalRegistry = normalizeInto(globalRegistry, defaultSeed, { mapId: "seed" });
    globalRegistry = normalizeInto(globalRegistry, loadBundledMap("models.bs"), {
      mapId: "catalog",
    });

    const combined = interleave(globalRegistry, ["seed", "catalog"]);
    const itemIds = combined.categories.flatMap((category) =>
      category.items.map((item) => item.id)
    );

    expect(combined.id).toBe("interleave-seed-catalog");
    expect(itemIds).toContain("gestalt");
    expect(itemIds).toContain("planets");
    expect(itemIds).toContain("bs-format-simple");
  });

  it("clones global registries defensively", () => {
    const original = normalizeInto(createGlobalRegistry(), createModel(), {
      mapId: "map-1",
    });
    const copy = cloneGlobalRegistry(original);

    copy.items.api.name = "Changed";
    copy.maps["map-1"].title = "Changed";

    expect(original.items.api.name).toBe("API");
    expect(original.maps["map-1"].title).toBe("Test Model");
  });
});

import { describe, expect, it } from "vitest";
import {
  buildModelIndex,
  extractSubgraph,
  filterCategory,
  findDependents,
  formatValidationErrors,
  getItem,
  listItems,
  validateModel,
} from "../src/blockscapeModel";
import { buildSciSeriesContext, validateSciCode } from "../src/sciRuntime";

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

describe("blockscapeModel", () => {
  it("accepts a valid current-schema model", () => {
    const validation = validateModel(createModel());
    expect(validation.ok).toBe(true);
    expect(validation.errors).toEqual([]);
  });

  it("rejects duplicate item ids", () => {
    const model = createModel();
    model.categories[1].items[2].id = "api";
    const validation = validateModel(model);
    expect(validation.ok).toBe(false);
    expect(formatValidationErrors(validation.errors).join("\n")).toContain(
      'Duplicate item id "api"'
    );
  });

  it("rejects broken dependency references", () => {
    const model = createModel();
    model.categories[0].items[0].deps = ["missing-id"];
    const validation = validateModel(model);
    expect(validation.ok).toBe(false);
    expect(formatValidationErrors(validation.errors).join("\n")).toContain(
      'Dependency "missing-id" does not match any item id.'
    );
  });

  it("rejects invalid stages", () => {
    const model = createModel();
    model.categories[0].items[0].stage = 7;
    const validation = validateModel(model);
    expect(validation.ok).toBe(false);
    expect(formatValidationErrors(validation.errors).join("\n")).toContain(
      "Item stage must be an integer between 1 and 4."
    );
  });

  it("finds dependents from the derived index", () => {
    expect(findDependents(createModel(), "db").map((item) => item.id).sort()).toEqual([
      "api",
      "cache",
    ]);
    expect(buildModelIndex(createModel()).reusedLocal.has("db")).toBe(true);
  });

  it("extracts a connected subgraph and trims deps", () => {
    const subgraph = extractSubgraph(createModel(), "api");
    expect(listItems(subgraph).map((item) => item.id).sort()).toEqual([
      "api",
      "db",
      "frontend",
    ]);
    expect(getItem(subgraph, "frontend").deps).toEqual(["api"]);
    expect(getItem(subgraph, "api").deps).toEqual(["db"]);
  });

  it("filters a category while preserving top-level metadata", () => {
    const filtered = filterCategory(createModel(), "experience");
    expect(filtered.id).toBe("test-model");
    expect(filtered.abstract).toBe("<p>Summary</p>");
    expect(filtered.backgroundUrl).toBe("https://example.com/bg.png");
    expect(filtered.categories).toHaveLength(1);
    expect(filtered.categories[0].id).toBe("experience");
  });
});

describe("sciRuntime helpers", () => {
  it("allows normal helper expressions and blocks js interop", () => {
    expect(validateSciCode('(find-dependents map "db")')).toEqual({
      ok: true,
      error: "",
    });
    expect(validateSciCode("js/Math.PI")).toEqual({
      ok: false,
      error: "JavaScript interop via js/ is not allowed in Query mode.",
    });
  });

  it("builds read-only series metadata for query context", () => {
    const context = buildSciSeriesContext({
      seriesId: "planets",
      title: "Planets",
      apicurioActiveVersionIndex: 1,
      apicurioVersions: [
        { version: "1", data: { id: "mercury", title: "Mercury", seriesId: "planets" } },
        { version: "2", data: { id: "venus", title: "Venus", seriesId: "planets" } },
        { version: "cat:experience", data: { id: "derived" }, isCategoryView: true },
      ],
    });

    expect(context).toEqual({
      seriesId: "planets",
      title: "Planets",
      activeVersionIndex: 1,
      versionCount: 2,
      versions: [
        {
          index: 0,
          version: "1",
          modelId: "mercury",
          title: "Mercury",
          seriesId: "planets",
        },
        {
          index: 1,
          version: "2",
          modelId: "venus",
          title: "Venus",
          seriesId: "planets",
        },
      ],
    });
  });
});

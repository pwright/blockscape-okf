const ID_PATTERN = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/;
const STAGE_MIN = 1;
const STAGE_MAX = 4;

function escapeEdnString(value) {
  return JSON.stringify(value);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

export function makeDownloadName(base) {
  return (
    (base || "blockscape")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "blockscape"
  );
}

export function isValidBlockscapeId(value) {
  return ID_PATTERN.test((value ?? "").toString().trim());
}

export function normalizeStageValue(stage) {
  if (stage == null || stage === "") return null;
  const num = Number(stage);
  if (!Number.isFinite(num)) return null;
  const rounded = Math.round(num);
  if (rounded < STAGE_MIN || rounded > STAGE_MAX) return null;
  return rounded;
}

export function ensureModelMetadata(
  data,
  { titleHint = "Untitled Model", idHint, uid = defaultUid } = {}
) {
  if (!data || typeof data !== "object") return data;
  const trimmedTitle = (data.title ?? "").toString().trim();
  data.title = trimmedTitle || titleHint || "Untitled Model";

  const trimmedId = (data.id ?? "").toString().trim();
  if (!trimmedId) {
    const base = idHint || data.title || titleHint || "model";
    const slug = makeDownloadName(base).replace(/\./g, "-");
    data.id = slug || `model-${uid()}`;
  } else {
    data.id = trimmedId;
  }

  if (typeof data.abstract !== "string") {
    data.abstract = data.abstract == null ? "" : String(data.abstract);
  }
  return data;
}

export function cloneModelData(data) {
  return cloneValue(data);
}

function defaultUid() {
  return Math.random().toString(36).slice(2, 10);
}

function stableStringify(value) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
  }
  const keys = Object.keys(value).sort();
  const parts = keys.map(
    (key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`
  );
  return `{${parts.join(",")}}`;
}

export function computeJsonFingerprint(input) {
  try {
    const value = typeof input === "string" ? JSON.parse(input) : input;
    const fp = stableStringify(value);
    if (fp) return fp;
  } catch (error) {
    console.warn("[Blockscape] fingerprint parse failed", error);
  }
  try {
    return JSON.stringify(input) || "";
  } catch {
    return "";
  }
}

export function collectAllItemIds(modelData) {
  const ids = new Set();
  (modelData?.categories || []).forEach((category) =>
    (category.items || []).forEach((item) => {
      if (item?.id) ids.add(item.id);
    })
  );
  return ids;
}

export function listItems(modelData) {
  const items = [];
  (modelData?.categories || []).forEach((category) => {
    (category.items || []).forEach((item) => {
      items.push(cloneValue(item));
    });
  });
  return items;
}

export function findItemAndCategoryById(modelData, itemId) {
  if (!itemId) return null;
  const categories = modelData?.categories || [];
  for (const category of categories) {
    const items = category?.items || [];
    const item = items.find((entry) => entry?.id === itemId);
    if (item) {
      return { category, item, modelData };
    }
  }
  return null;
}

export function getItem(modelData, itemId) {
  const match = findItemAndCategoryById(modelData, itemId);
  return match?.item ? cloneValue(match.item) : null;
}

export function findDependents(modelData, itemId) {
  return listItems(modelData).filter((item) =>
    Array.isArray(item?.deps) ? item.deps.includes(itemId) : false
  );
}

export function buildModelIndex(modelData) {
  const fwd = new Map();
  const rev = new Map();
  const seen = new Set();

  (modelData?.categories || []).forEach((category) =>
    (category.items || []).forEach((item) => {
      const id = (item?.id ?? "").toString().trim();
      if (!id) return;
      seen.add(id);
      const deps = new Set(Array.isArray(item?.deps) ? item.deps : []);
      fwd.set(id, deps);
      deps.forEach((depId) => {
        if (!rev.has(depId)) rev.set(depId, new Set());
        rev.get(depId).add(id);
      });
    })
  );

  const reusedLocal = new Set();
  rev.forEach((dependents, itemId) => {
    if ((dependents?.size || 0) >= 2) reusedLocal.add(itemId);
  });

  return { m: modelData, fwd, rev, reusedLocal, seen };
}

export function filterCategory(modelData, categoryId) {
  const categories = Array.isArray(modelData?.categories)
    ? modelData.categories
    : [];
  const matches = categories.filter((category) => category?.id === categoryId);
  if (!matches.length) return null;
  return {
    ...cloneValue(modelData),
    categories: matches.map((category) => cloneValue(category)),
  };
}

function walkGraph(startId, nextIds) {
  const pending = [startId];
  const seen = new Set();
  while (pending.length) {
    const current = pending.pop();
    if (!current || seen.has(current)) continue;
    seen.add(current);
    nextIds(current).forEach((nextId) => {
      if (!seen.has(nextId)) pending.push(nextId);
    });
  }
  return seen;
}

export function extractSubgraph(modelData, itemId) {
  const index = buildModelIndex(modelData);
  if (!index.seen.has(itemId)) return null;

  const depIds = walkGraph(itemId, (currentId) =>
    Array.from(index.fwd.get(currentId) || [])
  );
  const revIds = walkGraph(itemId, (currentId) =>
    Array.from(index.rev.get(currentId) || [])
  );
  const keepIds = new Set([...depIds, ...revIds]);

  const categories = (modelData?.categories || [])
    .map((category) => {
      const items = (category?.items || [])
        .filter((item) => keepIds.has(item?.id))
        .map((item) => ({
          ...cloneValue(item),
          deps: (Array.isArray(item?.deps) ? item.deps : []).filter((depId) =>
            keepIds.has(depId)
          ),
        }));
      if (!items.length) return null;
      return {
        ...cloneValue(category),
        items,
      };
    })
    .filter(Boolean);

  return {
    ...cloneValue(modelData),
    categories,
  };
}

function pushValidationError(errors, path, message) {
  errors.push({ path, message });
}

function validateItem(item, ids, errors, path) {
  if (!isPlainObject(item)) {
    pushValidationError(errors, path, "Item must be an object.");
    return;
  }
  const id = (item.id ?? "").toString().trim();
  if (!id) {
    pushValidationError(errors, `${path}.id`, "Item id is required.");
  } else {
    if (!isValidBlockscapeId(id)) {
      pushValidationError(
        errors,
        `${path}.id`,
        "Item id must be lowercase and may contain letters, numbers, '-', '_' or '.'."
      );
    }
    if (ids.has(id)) {
      pushValidationError(errors, `${path}.id`, `Duplicate item id "${id}".`);
    }
    ids.add(id);
  }

  const name = (item.name ?? "").toString().trim();
  if (!name) {
    pushValidationError(errors, `${path}.name`, "Item name is required.");
  }

  if (item.stage != null && normalizeStageValue(item.stage) == null) {
    pushValidationError(
      errors,
      `${path}.stage`,
      "Item stage must be an integer between 1 and 4."
    );
  }

  if (item.deps != null && !Array.isArray(item.deps)) {
    pushValidationError(errors, `${path}.deps`, "Item deps must be an array.");
  }
}

function validateCategory(category, ids, errors, path) {
  if (!isPlainObject(category)) {
    pushValidationError(errors, path, "Category must be an object.");
    return;
  }
  const id = (category.id ?? "").toString().trim();
  if (!id) {
    pushValidationError(errors, `${path}.id`, "Category id is required.");
  } else if (!isValidBlockscapeId(id)) {
    pushValidationError(
      errors,
      `${path}.id`,
      "Category id must be lowercase and may contain letters, numbers, '-', '_' or '.'."
    );
  }
  if (!Array.isArray(category.items)) {
    pushValidationError(errors, `${path}.items`, "Category items must be an array.");
    return;
  }
  category.items.forEach((item, itemIndex) => {
    validateItem(item, ids, errors, `${path}.items[${itemIndex}]`);
  });
}

export function validateModel(modelData) {
  const errors = [];
  if (!isPlainObject(modelData)) {
    pushValidationError(errors, "$", "Model must be an object.");
    return { ok: false, errors };
  }

  const id = (modelData.id ?? "").toString().trim();
  if (!id) {
    pushValidationError(errors, "$.id", "Model id is required.");
  } else if (!isValidBlockscapeId(id)) {
    pushValidationError(
      errors,
      "$.id",
      "Model id must be lowercase and may contain letters, numbers, '-', '_' or '.'."
    );
  }

  const title = (modelData.title ?? "").toString().trim();
  if (!title) {
    pushValidationError(errors, "$.title", "Model title is required.");
  }

  if (!Array.isArray(modelData.categories)) {
    pushValidationError(errors, "$.categories", "Model categories must be an array.");
    return { ok: false, errors };
  }

  const itemIds = new Set();
  modelData.categories.forEach((category, categoryIndex) => {
    validateCategory(category, itemIds, errors, `$.categories[${categoryIndex}]`);
  });

  modelData.categories.forEach((category, categoryIndex) => {
    if (!Array.isArray(category?.items)) return;
    category.items.forEach((item, itemIndex) => {
      const deps = Array.isArray(item?.deps) ? item.deps : [];
      deps.forEach((depId, depIndex) => {
        const trimmed = (depId ?? "").toString().trim();
        if (!trimmed) {
          pushValidationError(
            errors,
            `$.categories[${categoryIndex}].items[${itemIndex}].deps[${depIndex}]`,
            "Dependency id must not be empty."
          );
          return;
        }
        if (!itemIds.has(trimmed)) {
          pushValidationError(
            errors,
            `$.categories[${categoryIndex}].items[${itemIndex}].deps[${depIndex}]`,
            `Dependency "${trimmed}" does not match any item id.`
          );
        }
      });
    });
  });

  return { ok: errors.length === 0, errors };
}

export function formatValidationErrors(errors = []) {
  return errors.map((error) =>
    error?.path ? `${error.path}: ${error.message}` : error?.message || String(error)
  );
}

export function toEdn(value) {
  if (value == null) return "nil";
  if (typeof value === "string") return escapeEdnString(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error("Only finite numbers can be converted to EDN.");
    }
    return String(value);
  }
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) {
    return `[${value.map((entry) => toEdn(entry)).join(" ")}]`;
  }
  if (isPlainObject(value)) {
    const entries = Object.entries(value).filter(([, entry]) => entry !== undefined);
    return `{${entries
      .map(([key, entry]) => `${toEdnKey(key)} ${toEdn(entry)}`)
      .join(", ")}}`;
  }
  throw new Error(`Unsupported value for EDN conversion: ${typeof value}`);
}

function toEdnKey(key) {
  const trimmed = (key ?? "").toString().trim();
  if (isValidEdnKeyword(trimmed)) return `:${trimmed}`;
  return escapeEdnString(trimmed);
}

function isValidEdnKeyword(value) {
  return /^[A-Za-z0-9*+!_?.=<>/-]+$/.test(value);
}

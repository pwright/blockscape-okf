function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function noop() {}

function asLogger(logger) {
  return typeof logger === "function" ? logger : noop;
}

function uniqueStrings(values) {
  const seen = new Set();
  const out = [];
  (Array.isArray(values) ? values : []).forEach((value) => {
    const trimmed = (value ?? "").toString().trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    out.push(trimmed);
  });
  return out;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeItemShape(item) {
  if (!isPlainObject(item)) return null;
  const clone = cloneValue(item);
  clone.id = (clone.id ?? "").toString().trim();
  clone.name = (clone.name ?? "").toString().trim();
  clone.deps = uniqueStrings(clone.deps);
  return clone.id ? clone : null;
}

function cloneCategoryExtra(category) {
  const clone = cloneValue(category || {});
  delete clone.items;
  delete clone.id;
  delete clone.title;
  return clone;
}

function cloneMapExtra(mapJson) {
  const clone = cloneValue(mapJson || {});
  delete clone.categories;
  delete clone.id;
  delete clone.title;
  delete clone.abstract;
  delete clone.backgroundUrl;
  return clone;
}

function namespacedId(prefix, id, fallback = "category") {
  const left = (prefix ?? "").toString().trim();
  const right = (id ?? "").toString().trim();
  if (!left && !right) return fallback;
  if (!left) return right || fallback;
  if (!right) return `${left}-${fallback}`;
  return `${left}-${right}`;
}

export function createGlobalRegistry() {
  return {
    items: {},
    maps: {},
  };
}

export function cloneGlobalRegistry(globalRegistry) {
  return cloneValue(globalRegistry || createGlobalRegistry());
}

export function mergeItem(existing, incoming, { logger } = {}) {
  const log = asLogger(logger);
  const next = normalizeItemShape(incoming);
  if (!next) return existing ? cloneValue(existing) : null;
  if (!existing) {
    log("[Blockscape][global] normalize item", next.id);
    return next;
  }

  const current = normalizeItemShape(existing);
  if (!current) return next;
  if (current.id !== next.id) {
    throw new Error(
      `Cannot merge items with different ids: "${current.id}" vs "${next.id}".`
    );
  }

  const merged = { ...current };
  const keys = new Set([
    ...Object.keys(current),
    ...Object.keys(next),
  ]);

  keys.forEach((key) => {
    if (key === "id") return;
    if (key === "deps") {
      merged.deps = uniqueStrings([...(current.deps || []), ...(next.deps || [])]);
      return;
    }

    const existingValue = current[key];
    const incomingValue = next[key];
    const hasExisting = existingValue != null && existingValue !== "";
    const hasIncoming = incomingValue != null && incomingValue !== "";

    if (hasExisting && hasIncoming) {
      const same =
        JSON.stringify(existingValue) === JSON.stringify(incomingValue);
      if (!same) {
        log("[Blockscape][global] merge conflict", {
          itemId: current.id,
          field: key,
          kept: existingValue,
          ignored: incomingValue,
        });
      }
      merged[key] = existingValue;
      return;
    }

    if (hasExisting) {
      merged[key] = existingValue;
      return;
    }
    if (hasIncoming) {
      merged[key] = incomingValue;
      return;
    }
    if (key in merged) return;
    merged[key] = incomingValue;
  });

  return merged;
}

function sanitizeDeps(items, { logger } = {}) {
  const log = asLogger(logger);
  const known = new Set(Object.keys(items));
  const nextItems = { ...items };

  Object.keys(nextItems).forEach((itemId) => {
    const item = nextItems[itemId];
    const deps = uniqueStrings(item?.deps);
    const filtered = deps.filter((depId) => known.has(depId));
    if (filtered.length !== deps.length) {
      log("[Blockscape][global] dropping missing dependencies", {
        itemId,
        dropped: deps.filter((depId) => !known.has(depId)),
      });
    }
    nextItems[itemId] = {
      ...item,
      deps: filtered,
    };
  });

  return nextItems;
}

export function normalizeInto(globalRegistry, mapJson, { mapId, logger } = {}) {
  const log = asLogger(logger);
  const current = cloneGlobalRegistry(globalRegistry);
  if (!isPlainObject(mapJson)) {
    throw new Error("normalizeInto requires a map object.");
  }

  const modelId = (mapJson.id ?? "").toString().trim();
  const registryMapId = (mapId ?? modelId).toString().trim();
  if (!registryMapId) {
    throw new Error("normalizeInto requires a mapId or mapJson.id.");
  }

  const title = (mapJson.title ?? "").toString().trim();
  const hasAbstract = "abstract" in mapJson;
  const hasBackgroundUrl = "backgroundUrl" in mapJson;
  const abstract = hasAbstract ? (mapJson.abstract ?? "").toString() : undefined;
  const backgroundUrl = hasBackgroundUrl
    ? (mapJson.backgroundUrl ?? "").toString().trim()
    : undefined;

  log("[Blockscape][global] normalize map", {
    registryMapId,
    modelId: modelId || registryMapId,
    title,
  });

  let nextItems = { ...current.items };
  const seenInMap = new Set();

  const categories = (Array.isArray(mapJson.categories) ? mapJson.categories : [])
    .map((category, categoryIndex) => {
      if (!isPlainObject(category)) return null;
      const categoryId = (category.id ?? "").toString().trim();
      const categoryTitle = (category.title ?? "").toString().trim();
      const itemIds = [];

      (Array.isArray(category.items) ? category.items : []).forEach((item, itemIndex) => {
        const normalizedItem = normalizeItemShape(item);
        if (!normalizedItem) {
          log("[Blockscape][global] skipping invalid item", {
            registryMapId,
            categoryId,
            categoryIndex,
            itemIndex,
          });
          return;
        }

        nextItems[normalizedItem.id] = mergeItem(nextItems[normalizedItem.id], normalizedItem, {
          logger: log,
        });

        if (seenInMap.has(normalizedItem.id)) {
          log("[Blockscape][global] duplicate item reference in map", {
            registryMapId,
            itemId: normalizedItem.id,
            categoryId,
          });
          return;
        }
        seenInMap.add(normalizedItem.id);
        itemIds.push(normalizedItem.id);
      });

      return {
        id: categoryId || `category-${categoryIndex + 1}`,
        title: categoryTitle || categoryId || `Category ${categoryIndex + 1}`,
        itemIds,
        extra: cloneCategoryExtra(category),
      };
    })
    .filter(Boolean);

  nextItems = sanitizeDeps(nextItems, { logger: log });

  const nextMaps = {
    ...current.maps,
    [registryMapId]: {
      id: registryMapId,
      modelId: modelId || registryMapId,
      title: title || modelId || registryMapId,
      abstract,
      backgroundUrl,
      hasAbstract,
      hasBackgroundUrl,
      extra: cloneMapExtra(mapJson),
      categories,
    },
  };

  return {
    items: nextItems,
    maps: nextMaps,
  };
}

export function collectMapItemIds(globalRegistry, mapId) {
  const mapRecord = globalRegistry?.maps?.[mapId];
  if (!mapRecord) return [];
  const seen = new Set();
  const out = [];
  (Array.isArray(mapRecord.categories) ? mapRecord.categories : []).forEach((category) => {
    (Array.isArray(category?.itemIds) ? category.itemIds : []).forEach((itemId) => {
      const trimmed = (itemId ?? "").toString().trim();
      if (!trimmed || seen.has(trimmed)) return;
      seen.add(trimmed);
      out.push(trimmed);
    });
  });
  return out;
}

export function materialize(globalRegistry, mapId) {
  const mapRecord = globalRegistry?.maps?.[mapId];
  if (!mapRecord) return null;

  const materialized = {
    id: mapRecord.modelId || mapRecord.id,
    title: mapRecord.title || mapRecord.modelId || mapRecord.id,
    ...cloneValue(mapRecord.extra || {}),
    categories: (Array.isArray(mapRecord.categories) ? mapRecord.categories : [])
      .map((category) => ({
        id: category.id,
        title: category.title,
        ...cloneValue(category.extra || {}),
        items: (Array.isArray(category.itemIds) ? category.itemIds : [])
          .map((itemId) => globalRegistry?.items?.[itemId])
          .filter(Boolean)
          .map((item) => cloneValue(item)),
      })),
  };
  if (mapRecord.hasAbstract) materialized.abstract = mapRecord.abstract || "";
  if (mapRecord.hasBackgroundUrl) {
    materialized.backgroundUrl = mapRecord.backgroundUrl || "";
  }
  return materialized;
}

function dependencyClosure(globalRegistry, itemIds) {
  const items = globalRegistry?.items || {};
  const pending = [...uniqueStrings(itemIds)];
  const seen = new Set();

  while (pending.length) {
    const current = pending.pop();
    if (!current || seen.has(current) || !items[current]) continue;
    seen.add(current);
    uniqueStrings(items[current].deps).forEach((depId) => {
      if (!seen.has(depId)) pending.push(depId);
    });
  }

  return seen;
}

export function findDependents(globalRegistry, itemId) {
  const normalizedId = (itemId ?? "").toString().trim();
  if (!normalizedId) return [];
  return Object.values(globalRegistry?.items || {})
    .filter((item) => uniqueStrings(item?.deps).includes(normalizedId))
    .map((item) => cloneValue(item));
}

export function extractSubgraph(globalRegistry, itemIds, options = {}) {
  const keepIds = dependencyClosure(globalRegistry, itemIds);
  const keptItems = Array.from(keepIds)
    .map((itemId) => globalRegistry?.items?.[itemId])
    .filter(Boolean)
    .map((item) => cloneValue(item));

  return {
    id: options.id || "subgraph",
    title: options.title || "Subgraph",
    abstract: options.abstract || "",
    categories: [
      {
        id: options.categoryId || "subgraph",
        title: options.categoryTitle || "Subgraph",
        items: keptItems,
      },
    ],
  };
}

export function interleave(globalRegistry, mapIds, options = {}) {
  const selectedMapIds = uniqueStrings(mapIds);
  const log = asLogger(options.logger);
  const directIds = new Set();

  selectedMapIds.forEach((mapId) => {
    collectMapItemIds(globalRegistry, mapId).forEach((itemId) => {
      directIds.add(itemId);
    });
  });

  const keepIds = dependencyClosure(globalRegistry, Array.from(directIds));
  const assigned = new Set();
  const categories = [];

  log("[Blockscape][global] interleave maps", {
    mapIds: selectedMapIds,
    directItemCount: directIds.size,
    materializedItemCount: keepIds.size,
  });

  selectedMapIds.forEach((mapId) => {
    const mapRecord = globalRegistry?.maps?.[mapId];
    if (!mapRecord) return;
    const scope = mapRecord.modelId || mapRecord.id;
    (Array.isArray(mapRecord.categories) ? mapRecord.categories : []).forEach((category) => {
      const itemIds = (Array.isArray(category?.itemIds) ? category.itemIds : []).filter(
        (itemId) =>
          directIds.has(itemId) && keepIds.has(itemId) && !assigned.has(itemId)
      );
      if (!itemIds.length) return;
      itemIds.forEach((itemId) => assigned.add(itemId));
      categories.push({
        id: namespacedId(scope, category.id, "category"),
        title:
          selectedMapIds.length > 1
            ? `${mapRecord.title} / ${category.title}`
            : category.title,
        items: itemIds
          .map((itemId) => globalRegistry?.items?.[itemId])
          .filter(Boolean)
          .map((item) => cloneValue(item)),
      });
    });
  });

  const dependencyItems = Array.from(keepIds)
    .filter((itemId) => !assigned.has(itemId))
    .map((itemId) => globalRegistry?.items?.[itemId])
    .filter(Boolean)
    .map((item) => cloneValue(item));

  if (dependencyItems.length) {
    categories.push({
      id: options.dependencyCategoryId || "dependencies",
      title: options.dependencyCategoryTitle || "Dependencies",
      items: dependencyItems,
    });
  }

  return {
    id: options.id || `interleave-${selectedMapIds.join("-") || "map"}`,
    title: options.title || "Interleaved map",
    abstract: options.abstract || "",
    categories,
  };
}

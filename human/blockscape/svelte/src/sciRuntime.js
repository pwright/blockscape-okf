import scittleScriptSource from "scittle/dist/scittle.js?raw";
import { toEdn } from "./blockscapeModel";

const DEFAULT_QUERY_TIMEOUT_MS = 5000;

const DISALLOWED_PATTERNS = [
  {
    pattern: /(^|[^\w-])js\//,
    message: "JavaScript interop via js/ is not allowed in Query mode.",
  },
  {
    pattern: /\(\s*\./,
    message: "Method/property interop is not allowed in Query mode.",
  },
  {
    pattern: /\.\-/,
    message: "Direct property interop is not allowed in Query mode.",
  },
  {
    pattern: /\.\./,
    message: "Threaded interop is not allowed in Query mode.",
  },
  {
    pattern:
      /(^|[\s([{\]])(?:ns|in-ns|require|import|load-file|load-string|eval|set!|def|defn|defmacro|deftype|defrecord|extend-type|extend-protocol|intern|alter-var-root|with-redefs)(?=$|[\s)\]}])/,
    message: "That form is not allowed in Query mode.",
  },
  {
    pattern: /(^|[\s([{\]])new(?=$|[\s)\]}])/,
    message: "Object construction is not allowed in Query mode.",
  },
  {
    pattern: /#=/,
    message: "Reader eval is not allowed in Query mode.",
  },
];

let scittleLoadPromise = null;

function stripSourceMapComment(source) {
  return (source || "").replace(
    /\n\/\/# sourceMappingURL=.*?(?:\r?\n)?$/,
    "\n"
  );
}

function getScittleEval() {
  return globalThis?.scittle?.core?.eval_string || null;
}

async function ensureScittleLoaded() {
  const existing = getScittleEval();
  if (existing) return existing;
  if (!scittleLoadPromise) {
    scittleLoadPromise = new Promise((resolve, reject) => {
      if (typeof document === "undefined") {
        reject(new Error("SCI runtime requires a browser document."));
        return;
      }
      const script = document.createElement("script");
      const blob = new Blob([stripSourceMapComment(scittleScriptSource)], {
        type: "text/javascript",
      });
      const scriptUrl = URL.createObjectURL(blob);
      script.src = scriptUrl;
      script.async = true;
      script.onload = () => {
        URL.revokeObjectURL(scriptUrl);
        const loaded = getScittleEval();
        if (!loaded) {
          reject(new Error("SCI runtime loaded but no eval function was exposed."));
          return;
        }
        resolve(loaded);
      };
      script.onerror = () => {
        URL.revokeObjectURL(scriptUrl);
        reject(new Error("Failed to load the browser SCI runtime."));
      };
      document.head.appendChild(script);
    });
  }
  return scittleLoadPromise;
}

function stripStringsAndComments(code) {
  let out = "";
  let inString = false;
  let inComment = false;

  for (let i = 0; i < code.length; i += 1) {
    const char = code[i];
    const prev = code[i - 1];

    if (inComment) {
      if (char === "\n") {
        inComment = false;
        out += "\n";
      } else {
        out += " ";
      }
      continue;
    }

    if (inString) {
      if (char === '"' && prev !== "\\") {
        inString = false;
      }
      out += " ";
      continue;
    }

    if (char === ";") {
      inComment = true;
      out += " ";
      continue;
    }

    if (char === '"') {
      inString = true;
      out += " ";
      continue;
    }

    out += char;
  }

  return out;
}

export function validateSciCode(code) {
  const source = (code || "").trim();
  if (!source) {
    return { ok: false, error: "Enter a Clojure expression to run." };
  }

  const sanitized = stripStringsAndComments(source);
  for (const rule of DISALLOWED_PATTERNS) {
    if (rule.pattern.test(sanitized)) {
      return { ok: false, error: rule.message };
    }
  }

  return { ok: true, error: "" };
}

function buildQueryWrapper(code, context) {
  const mapEdn = toEdn(context?.map || {});
  const seriesEdn = toEdn(context?.series || null);
  const globalEdn = toEdn(context?.global || null);
  return `
(let [list-items
      (fn [m]
        (vec
         (mapcat
          (fn [category]
            (vec (or (:items category) [])))
          (or (:categories m) []))))
      get-item
      (fn [m item-id]
        (some
         (fn [item]
           (when (= (:id item) item-id) item))
         (list-items m)))
      find-dependents
      (fn [m item-id]
        (vec
         (filter
          (fn [item]
            (some #(= % item-id) (or (:deps item) [])))
          (list-items m))))
      filter-category
      (fn [m category-id]
        (let [categories
              (vec
               (filter
                (fn [category]
                  (= (:id category) category-id))
                (or (:categories m) [])))]
          (when (seq categories)
            (assoc m :categories categories))))
      extract-subgraph
      (fn [m item-id]
        (let [items (list-items m)
              by-id (into {} (map (juxt :id identity) items))
              deps-of (fn [id] (vec (or (:deps (get by-id id)) [])))
              revs-of
              (fn [id]
                (vec
                 (map :id
                      (filter
                       (fn [item]
                         (some #(= % id) (or (:deps item) [])))
                       items))))
              walk
              (fn walk [start next-fn]
                (loop [pending [start]
                       seen #{}]
                  (if-let [current (peek pending)]
                    (if (seen current)
                      (recur (pop pending) seen)
                      (let [next-ids (remove seen (next-fn current))]
                        (recur (into (pop pending) next-ids)
                               (conj seen current))))
                    seen)))]
          (when (contains? by-id item-id)
            (let [keep-ids (into (walk item-id deps-of) (walk item-id revs-of))
                  categories
                  (->> (or (:categories m) [])
                       (map
                        (fn [category]
                          (let [items
                                (->> (or (:items category) [])
                                     (filter (fn [item] (contains? keep-ids (:id item))))
                                     (map (fn [item]
                                            (assoc item :deps
                                                   (vec (filter keep-ids (or (:deps item) []))))))
                                     vec)]
                            (when (seq items)
                              (assoc category :items items)))))
                       (filter some?)
                       vec)]
              (assoc m :categories categories)))))
      global ${globalEdn}
      model ${mapEdn}
      map ${mapEdn}
      series ${seriesEdn}
      result
      (do
        ${code})]
  (clj->js result))
  `.trim();
}

function normalizeRuntimeError(error) {
  if (!error) return "SCI evaluation failed.";
  if (typeof error.message === "string" && error.message.trim()) {
    return error.message.trim();
  }
  return String(error);
}

export function buildSciSeriesContext(entry) {
  const versions = Array.isArray(entry?.apicurioVersions)
    ? entry.apicurioVersions
        .filter((version) => !version?.isCategoryView)
        .map((version, index) => ({
          index,
          version: (version?.version ?? "").toString().trim() || String(index + 1),
          modelId: (version?.data?.id ?? "").toString().trim() || null,
          title: (version?.data?.title ?? "").toString().trim() || null,
          seriesId: (version?.data?.seriesId ?? "").toString().trim() || null,
        }))
    : [];

  return {
    seriesId: (entry?.seriesId ?? entry?.apicurioArtifactId ?? "").toString().trim() || null,
    title: (entry?.title ?? entry?.apicurioArtifactName ?? "").toString().trim() || null,
    activeVersionIndex: Number.isInteger(entry?.apicurioActiveVersionIndex)
      ? entry.apicurioActiveVersionIndex
      : 0,
    versionCount: versions.length,
    versions,
  };
}

export async function runSci(
  code,
  context,
  { timeoutMs = DEFAULT_QUERY_TIMEOUT_MS } = {}
) {
  const guard = validateSciCode(code);
  if (!guard.ok) {
    return { ok: false, error: guard.error, timingMs: 0, value: null };
  }

  const evaluate = await ensureScittleLoaded();
  const wrapped = buildQueryWrapper(code, context);
  const startedAt = performance.now();

  try {
    const result = evaluate(wrapped);
    const value =
      result && typeof result.then === "function"
        ? await promiseWithTimeout(result, timeoutMs)
        : result;
    return {
      ok: true,
      value,
      error: "",
      timingMs: Math.round((performance.now() - startedAt) * 100) / 100,
    };
  } catch (error) {
    return {
      ok: false,
      value: null,
      error: normalizeRuntimeError(error),
      timingMs: Math.round((performance.now() - startedAt) * 100) / 100,
    };
  }
}

function promiseWithTimeout(promise, timeoutMs) {
  let timer = null;
  return Promise.race([
    promise.finally(() => {
      if (timer) clearTimeout(timer);
    }),
    new Promise((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error(`SCI evaluation exceeded ${timeoutMs}ms.`));
      }, timeoutMs);
    }),
  ]);
}

export async function requestAiProposal() {
  throw new Error("AI proposal flow is not implemented in this slice.");
}

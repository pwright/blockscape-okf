# Query Reference

Blockscape includes a browser-side SCI query panel for inspecting and transforming the active map with small Clojure expressions.

The query tab binds:

- `map`: the active Blockscape model as data
- `model`: the same active model, exposed under a non-shadowing name
- `global`: the read-only normalized in-memory registry of loaded maps and items
- `series`: read-only metadata for the active series, when present

Use `model` in most examples. `map` is still available for compatibility, but it shadows the standard Clojure `map` function in query expressions.

Built-in helpers:

- `list-items`
- `get-item`
- `find-dependents`
- `filter-category`
- `extract-subgraph`

`global` has this shape:

```clojure
{:items {item-id {:id ... :name ... :deps [...] ...}}
 :maps  {global-map-id
         {:id global-map-id
          :modelId "original-bs-id"
          :title "Map title"
          :categories [{:id ... :title ... :itemIds [...]}]}}}
```

## What Queries Return

Queries can return any normal result:

- a scalar like a string, number, or boolean
- a single item map
- a list/vector of items
- a full Blockscape model

Only full valid models can be applied back to the active map.

## Basic Examples

List every item in the current map:

```clojure
(list-items model)
```

Count all items:

```clojure
(count (list-items model))
```

List all item IDs:

```clojure
(map :id (list-items model))
```

List all item names:

```clojure
(map :name (list-items model))
```

Return the model title:

```clojure
(:title model)
```

Return all category IDs:

```clojure
(map :id (:categories model))
```

Count categories:

```clojure
(count (:categories model))
```

Count all loaded maps in memory:

```clojure
(count (keys (:maps global)))
```

List loaded map titles:

```clojure
(map :title (vals (:maps global)))
```

List all globally known item IDs:

```clojure
(sort (keys (:items global)))
```

## Looking Up Specific Things

Get one item by ID:

```clojure
(get-item model "api")
```

Return just the name of one item:

```clojure
(:name (get-item model "api"))
```

Check whether an item exists:

```clojure
(some? (get-item model "api"))
```

Show an item's dependencies:

```clojure
(:deps (get-item model "frontend"))
```

Show an item's stage:

```clojure
(:stage (get-item model "frontend"))
```

Show an item's external link:

```clojure
(:external (get-item model "frontend"))
```

## Dependency Queries

Find direct dependents of an item:

```clojure
(find-dependents model "db")
```

Count direct dependents:

```clojure
(count (find-dependents model "db"))
```

Return only dependent item IDs:

```clojure
(map :id (find-dependents model "db"))
```

Sort dependent IDs alphabetically:

```clojure
(sort (map :id (find-dependents model "db")))
```

Find items with at least one dependency:

```clojure
(filter #(seq (:deps %)) (list-items model))
```

Find items with no dependencies:

```clojure
(filter #(empty? (or (:deps %) [])) (list-items model))
```

Count items with no dependencies:

```clojure
(count
 (filter #(empty? (or (:deps %) []))
         (list-items model)))
```

Find items that depend on either `db` or `cache`:

```clojure
(filter
 #(some #{"db" "cache"} (or (:deps %) []))
 (list-items model))
```

## Category Queries

Return a single category:

```clojure
(first
 (filter #(= (:id %) "experience")
         (:categories model)))
```

Return all items in one category:

```clojure
(:items
 (first
 (filter #(= (:id %) "experience")
          (:categories model))))
```

Return item counts per category:

```clojure
(map
 (fn [category]
   {:category (:id category)
    :count (count (:items category))})
 (:categories model))
```

Return only categories that contain items:

```clojure
(filter #(seq (:items %)) (:categories model))
```

Filter the active map down to one category:

```clojure
(filter-category model "experience")
```

That returns a full model and can usually be applied.

## Subgraph Queries

Extract the subgraph around one item:

```clojure
(extract-subgraph model "api")
```

Extract a subgraph, then list the surviving item IDs:

```clojure
(map :id
     (list-items
      (extract-subgraph model "api")))
```

Count items in a subgraph:

```clojure
(count
 (list-items
  (extract-subgraph model "api")))
```

See which categories remain after extraction:

```clojure
(map :id
     (:categories
      (extract-subgraph model "api")))
```

## Filtering And Analysis Examples

Find items in stage 1:

```clojure
(filter #(= 1 (:stage %)) (list-items model))
```

Find items in stage 4:

```clojure
(filter #(= 4 (:stage %)) (list-items model))
```

Count staged items:

```clojure
(count
 (filter :stage (list-items model)))
```

Find items that have logos:

```clojure
(filter :logo (list-items model))
```

Find items that have external links:

```clojure
(filter :external (list-items model))
```

Return only item summaries:

```clojure
(map
 (fn [item]
   {:id (:id item)
    :name (:name item)
    :deps (count (or (:deps item) []))})
 (list-items model))
```

Sort items by dependency count:

```clojure
(sort-by #(count (or (:deps %) []))
         (list-items model))
```

Sort descending by dependency count:

```clojure
(reverse
 (sort-by #(count (or (:deps %) []))
          (list-items model)))
```

Find the first item with the most dependencies:

```clojure
(last
 (sort-by #(count (or (:deps %) []))
          (list-items model)))
```

Group item IDs by stage:

```clojure
(reduce
 (fn [acc item]
   (update acc
           (or (:stage item) :none)
           (fnil conj [])
           (:id item)))
 {}
 (list-items model))
```

## Transform Examples

These examples return full model objects. If the result still satisfies the Blockscape schema, the Query tab will allow you to apply it.

Keep only one category:

```clojure
(filter-category model "experience")
```

Replace the model title:

```clojure
(assoc model :title "Filtered view")
```

Add or replace the abstract:

```clojure
(assoc model :abstract "<p>Generated from Query mode.</p>")
```

Remove the background image:

```clojure
(dissoc model :backgroundUrl)
```

Keep only categories that contain items:

```clojure
(update model :categories
        (fn [categories]
          (vec (filter #(seq (:items %)) categories))))
```

Remove items with no dependencies:

```clojure
(update model :categories
        (fn [categories]
          (vec
           (map
            (fn [category]
              (update category :items
                      (fn [items]
                        (vec
                         (filter #(seq (or (:deps %) [])) items)))))
            categories))))
```

Keep only items that have external links:

```clojure
(update model :categories
        (fn [categories]
          (->> categories
               (map
                (fn [category]
                  (update category :items
                          (fn [items]
                            (vec (filter :external items))))))
               (filter #(seq (:items %)))
               vec)))
```

Force every item into stage 2:

```clojure
(update model :categories
        (fn [categories]
          (vec
           (map
            (fn [category]
              (update category :items
                      (fn [items]
                        (vec
                         (map #(assoc % :stage 2) items)))))
            categories))))
```

Create a subgraph-focused model:

```clojure
(-> (extract-subgraph model "api")
    (assoc :title "API Focus"))
```

## Series Metadata Examples

`series` is metadata only. It is useful for inspection and display logic, but not as a writable map source.

Return the series ID:

```clojure
(:seriesId series)
```

Return the series title:

```clojure
(:title series)
```

Return the number of concrete versions:

```clojure
(:versionCount series)
```

List version labels:

```clojure
(map :version (:versions series))
```

List version model IDs:

```clojure
(map :modelId (:versions series))
```

Return the active series index:

```clojure
(:activeVersionIndex series)
```

## Small Utility Patterns

Use `->` to make transforms easier to read:

```clojure
(-> model
    (assoc :title "Example")
    (assoc :abstract "<p>Updated in query mode.</p>"))
```

Use `->>` for item pipelines:

```clojure
(->> (list-items model)
     (filter :external)
     (map :id)
     sort)
```

Build compact result tables:

```clojure
(->> (:categories model)
     (map (fn [category]
            [(:id category) (count (:items category))]))
     (into {}))
```

Return a boolean answer:

```clojure
(boolean (get-item model "api"))
```

Return a set of all dependency IDs used anywhere:

```clojure
(set
 (mapcat #(or (:deps %) [])
         (list-items model)))
```

## Common Mistakes

This looks like it should map over categories, but it actually calls the bound model value as a function because `map` is also the model binding:

```clojure
(map :id (:categories map))
```

Use `model` instead:

```clojure
(map :id (:categories model))
```

This does not return a full model, so it cannot be applied:

```clojure
(list-items model)
```

This usually returns a valid model and can be applied:

```clojure
(assoc model :title "New title")
```

This removes required structure and will fail validation:

```clojure
(dissoc model :categories)
```

This introduces broken dependency references and will fail validation:

```clojure
(assoc-in model [:categories 0 :items 0 :deps] ["missing-id"])
```

## Restrictions

Query mode is intentionally constrained:

- no `js/` interop
- no arbitrary `eval`
- no `require`, `import`, or `load-file`
- no filesystem or network access
- no direct mutation of app internals

Treat the query panel as a safe data transformation layer over the active Blockscape model.

import type { Db, Filters } from "@tissai/db"

export const getSuggestions = async (query: string, filters: Filters, db: Db) => {
  const suggestions = filters.category
    ? await db.suggestions.attributes(filters.category.id)
    : [await db.suggestions.category()]

  return suggestions
    .filter((s) => !!s.label && !!s.values?.length)
    .map((s) => ({
      ...s,
      values: s.values.map(v => ({
        name: v.name!,
        href: filters.category ?
         `/search?q=${encodeURIComponent(query)}&cat=${encodeURIComponent(filters.category!.id)}&att=${encodeURIComponent(v.id!)}`
        :`/search?q=${encodeURIComponent(query)}&cat=${encodeURIComponent(v.id!)}`
      }))
    }))
}

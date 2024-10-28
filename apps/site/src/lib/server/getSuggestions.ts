import type { Db, Filters } from "@tissai/db"
import { encodeParams } from "./encodeParams"

export const getSuggestions = async (query: string, filters: Filters, db: Db) => {
  const suggestions = filters.category
    ? await db.suggestions.attributes(filters.category.id)
    : [await db.suggestions.category()]

  return suggestions
    .filter((s) => !!s.label && !!s.values?.length)
    .map((s) => ({
      ...s,
      values: s.values.map(v => {
        const newFilters = filters.category ? {
          ...filters,
          attributes: [...filters.attributes ?? [], { label: s.label, name: v.name!, id: v.id! }]
        } : {
          ...filters,
          category: {
            name: v.name!,
            id: v.id!,
          },
        }

        return ({
        name: v.name!,
        href: `/search?${encodeParams(query, newFilters)}`
      })
      })
    }))
}

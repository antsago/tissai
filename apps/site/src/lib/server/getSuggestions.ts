import type { Db, Filters } from "@tissai/db"
import { encodeParams } from "./encodeParams"

export const getSuggestions = async (query: string, filters: Filters, db: Db) => {
  const suggestions = filters.category
    ? await db.suggestions.attributes(filters.category.id)
    : [await db.suggestions.category()]
  
  const baseParams = {
    query,
    ...filters,
    category: filters.category?.id,
    attributes: filters.attributes?.map(a => a.id)
  }

  return suggestions
    .filter((s) => !!s.label && !!s.values?.length)
    .map((s) => ({
      ...s,
      values: s.values.map(v => {
        const params = filters.category ? {
          ...baseParams,
          attributes: [...baseParams.attributes ?? [], v.id!],
        } : {
          ...baseParams,
          category: v.id!,
        }

        return ({
        name: v.name!,
        href: `/search?${encodeParams(params)}`
      })
      })
    }))
}

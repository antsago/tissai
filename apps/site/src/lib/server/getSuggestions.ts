import type { Db, Filters, Suggestion } from "@tissai/db"

export const getSuggestions = async (filters: Filters, db: Db) => {
  const suggestions = filters.category
    ? await db.suggestions.attributes(filters.category.id) 
    : [await db.suggestions.category()]

  return suggestions.filter(s => !!s.label && !!s.values?.length) as Suggestion[]
}

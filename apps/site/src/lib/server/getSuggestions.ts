import type { Db, Filters } from "@tissai/db"

export const getSuggestions = async (filters: Filters, db: Db) => {
  if (filters.category) {
    const suggestions = await db.suggestions.attributes(filters.category.id) 

    return suggestions
  }

  const suggestion = await db.suggestions.category()
  
  if (!suggestion.values?.length) {
    return []
  }
  
  return [suggestion]
}

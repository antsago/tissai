import type { Db, Filters } from "@tissai/db"

export const getSuggestions = async (filters: Filters, db: Db) => {
  const suggestion = await db.suggestions.category()
  
  if (!suggestion.values?.length) {
    return []
  }
  
  return [suggestion]
}

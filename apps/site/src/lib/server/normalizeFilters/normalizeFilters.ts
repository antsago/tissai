import type { Filters } from "@tissai/db"
import { type UrlParams } from "../decodeParams"
import { labelFilters } from "./labelFilters"
import { inferFilters } from "./inferFilters"

export async function normalizeFilters(
  { query, category, attributes, ...otherFilters }: UrlParams,
  locals: App.Locals,
): Promise<Filters> {
  if (category) {
    const labeled = await labelFilters(category, attributes, locals.db)

    if (labeled.category) {
      return {
        ...otherFilters,
        ...labeled,
      }
    }
  }

  if (!query) {
    return otherFilters
  }

  const infered = await inferFilters(query, locals)

  return {
    ...otherFilters,
    ...infered,
  }
}

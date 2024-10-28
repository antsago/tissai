import type { Filters } from "@tissai/db"
import { type UrlParams } from "../extractFilters"
import { labelFilters } from "./labelFilters"
import { inferFilters } from "./inferFilters"

export async function normalizeFilters(
  query: string | undefined,
  { category, attributes, ...otherFilters }: UrlParams,
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

import type { PageServerLoad } from "./$types"
import {
  getSuggestions,
  mergeTiles,
  extractFilters,
  normalizeFilters,
} from "$lib/server"

export const load: PageServerLoad = async ({ url, locals }) => {
  const { query, ...urlFilters } = extractFilters(url.searchParams)

  const filters = await normalizeFilters(query, urlFilters, locals)

  const products = await locals.db.products.search(query, filters)
  const suggestions = await getSuggestions(filters, locals.db)

  return {
    tiles: mergeTiles(products, suggestions),
    filters,
  }
}

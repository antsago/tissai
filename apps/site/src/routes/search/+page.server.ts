import type { PageServerLoad } from "./$types"
import {
  getSuggestions,
  mergeTiles,
  decodeParams,
  normalizeFilters,
} from "$lib/server"

export const load: PageServerLoad = async ({ url, locals }) => {
  const { query, ...urlFilters } = decodeParams(url.searchParams)

  const filters = await normalizeFilters(query, urlFilters, locals)

  const products = await locals.db.products.search(query, filters)
  const suggestions = await getSuggestions(query, filters, locals.db)

  return {
    tiles: mergeTiles(products, suggestions),
    filters,
  }
}

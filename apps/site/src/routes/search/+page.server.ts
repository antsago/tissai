import type { PageServerLoad } from "./$types"
import {
  getSuggestions,
  mergeTiles,
  decodeParams,
  normalizeFilters,
} from "$lib/server"

export const load: PageServerLoad = async ({ url, locals }) => {
  const params = decodeParams(url.searchParams)

  const filters = await normalizeFilters(params, locals)

  const products = await locals.db.products.search(params.query, filters)
  const suggestions = await getSuggestions(params.query, filters, locals.db)

  return {
    tiles: mergeTiles(products, suggestions),
    filters,
  }
}

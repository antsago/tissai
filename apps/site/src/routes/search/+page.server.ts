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

  const products = await locals.db.products.search(query ?? "", filters)
  const categorySuggestion = await locals.db.suggestions.category()

  // const [products, suggestions] = await Promise.all([
  //   locals.db.products.search({
  //     query,
  //     ...filters,
  //   }),
  //   getSuggestions(locals),
  // ])

  return {
    tiles: [categorySuggestion, ...products], //mergeTiles(products, suggestions),
    filters,
  }
}

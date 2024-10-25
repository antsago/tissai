import type { PageServerLoad } from "./$types"
import { getSuggestions, mergeTiles } from "$lib/server"
import { extractFilters } from "$lib/server/extractFilters"

export const load: PageServerLoad = async ({ url, locals }) => {
  const { query, category, attributes, ...otherFilters } = await extractFilters(url.searchParams)

  const [products, suggestions] = await Promise.all([
    locals.db.products.search({
      query,
      ...filters,
    }),
    getSuggestions(locals),
  ])

  return {
    tiles: mergeTiles(products, suggestions),
    filters,
  }
}

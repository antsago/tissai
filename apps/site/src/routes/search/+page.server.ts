import type { PageServerLoad } from "./$types"
import { parseSearchParams } from "./parseSearchParams"
import mergeTiles from "./mergeTiles"
import { getSuggestions } from "./getSuggestions"

export const load: PageServerLoad = async ({ url, locals }) => {
  const { query, ...filters } = await parseSearchParams(
    url.searchParams,
    locals,
  )
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

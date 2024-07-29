import type { PageServerLoad } from "./$types"
import parseSearchParams from "./parseSearchParams"
import mergeTiles from "./mergeTiles"

export const load: PageServerLoad = async ({ url, locals }) => {
  const { query, ...filters } = parseSearchParams(url.searchParams)
  const results = await locals.db.products.search({
    query,
    ...filters,
  })

  return {
    tiles: mergeTiles(results),
    filters,
  }
}

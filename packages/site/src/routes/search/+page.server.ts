import type { PageServerLoad } from "./$types"
import parseSearchParams from "./parseSearchParams"

export const load: PageServerLoad = async ({ url, locals }) => {
  const { query, ...filters } = parseSearchParams(url.searchParams)

  return {
    products: await locals.db.searchProducts({
      query,
      ...filters,
    }),
    filters,
  }
}

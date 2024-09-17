import type { PageServerLoad } from "./$types"
import parseSearchParams from "./parseSearchParams"
import mergeTiles from "./mergeTiles"

export const load: PageServerLoad = async ({ url, locals }) => {
  const { query, ...filters } = parseSearchParams(url.searchParams)
  const products = await locals.db.products.search({
    query,
    ...filters,
  })
  const words = (await locals.tokenizer.fromText(query)).filter(w => !!w.isMeaningful).map(w => w.text)
  const suggestions = await locals.db.suggestions.category(words)

  return {
    tiles: mergeTiles(products, [{ ...suggestions, frequency: 1 }]),
    filters,
  }
}

import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ url, locals }) => {
  const query = url.searchParams.get("q") || ""
  const brand = url.searchParams.get("brand")
  const category = url.searchParams.get("category")
  const tags = url.searchParams.getAll("inc")
  const min = url.searchParams.getAll("min").map(m => parseFloat(m))[0]
  const max = url.searchParams.getAll("max").map(m => parseFloat(m))[0]

  return {
    products: await locals.products.search({
      query,
      brand,
      category,
      min,
      max,
      tags,
    }),
  }
}

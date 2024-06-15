import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ url, locals }) => {
  const query = url.searchParams.get("q") || ""
  const brand = url.searchParams.get("brand")
  const category = url.searchParams.get("category")
  const tags = url.searchParams.getAll("inc")
  const min = parseFloat(url.searchParams.get("min"), 10)
  const max = parseFloat(url.searchParams.get("max"), 10)

  return {
    products: await locals.products.search({
      query,
      brand,
      category,
      min: isNaN(min) ? undefined : min,
      max: isNaN(max) ? undefined : max,
      tags,
    }),
  }
}

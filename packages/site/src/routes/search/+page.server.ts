import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ url, locals }) => {
  const query = url.searchParams.get("q") || ""
  const brand = url.searchParams.get("brand")
  const category = url.searchParams.get("category")

  return {
    products: await locals.products.search({ query, brand, category }),
  }
}

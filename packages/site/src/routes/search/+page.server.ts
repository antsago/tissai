import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ url, locals }) => {
  const query = url.searchParams.get("q") || ""
  const brand = url.searchParams.get("brand")

  return {
    products: await locals.products.search({ query, brand }),
  }
}

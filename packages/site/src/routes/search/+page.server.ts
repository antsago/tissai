import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ url, locals }) => {
  const query = url.searchParams.get("q") || ""
  
  const filters = {
    brand: url.searchParams.get("brand"),
    category: url.searchParams.get("category"),
    tags: url.searchParams.getAll("inc"),
    min: url.searchParams.getAll("min").map((m) => parseFloat(m))[0],
    max: url.searchParams.getAll("max").map((m) => parseFloat(m))[0],
  }

  return {
    products: await locals.products.search({
      query,
      ...filters,
    }),
    filters,
  }
}

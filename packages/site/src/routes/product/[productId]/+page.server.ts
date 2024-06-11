import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ params, locals }) => {
  return locals.products.getDetails(params.productId)
}

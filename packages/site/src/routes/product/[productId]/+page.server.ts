import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ params, locals }) => {
  return locals.db.getProductDetails(params.productId)
}

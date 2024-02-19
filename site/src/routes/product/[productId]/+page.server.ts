import type { PageServerLoad } from "./$types"
import { products } from "$lib/server"

export const load: PageServerLoad = async ({ params }) => {
	return products.getDetails(params.productId)
}

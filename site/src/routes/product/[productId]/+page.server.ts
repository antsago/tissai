import type { PageServerLoad } from "./$types"
import { Products } from "$lib/server"

export const load: PageServerLoad = async ({ params }) => {
	const product = await Products.getDetails(params.productId)
	return product
}

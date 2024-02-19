import type { PageServerLoad } from "./$types"
import { Products } from "$lib/server"

export const load: PageServerLoad = async ({ url }) => {
	const query = url.searchParams.get("q") || ""
	const products = await Products.search(query)

	return {
		products,
	}
}

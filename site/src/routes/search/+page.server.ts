import type { PageServerLoad } from "./$types"
import { products } from "$lib/server"

export const load: PageServerLoad = async ({ url }) => {
	const query = url.searchParams.get("q") || ""

	return {
		products: await products.search(query),
	}
}

import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ url, locals }) => {
	const query = url.searchParams.get("q") || ""

	return {
		products: await locals.products.search(query),
	}
}

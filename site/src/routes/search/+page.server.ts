import type { PageServerLoad } from "./$types"
import Embedder from "$lib/server/embedder"
import runQuery from "$lib/server/db"

const embedder = Embedder()

async function searchProducts(searchQuery: string) {
	const embedding = await embedder.embed(searchQuery)
	const sqlQuery = `
		SELECT
			id, name, images[1] AS image
		FROM products
		ORDER BY embedding <-> '[${embedding}]'
		LIMIT 20
	`
	return runQuery(sqlQuery)
}

export const load: PageServerLoad = async ({ url }) => {
	const query = url.searchParams.get("q") || ""
	const products = await searchProducts(query)

	return {
		products,
	}
}

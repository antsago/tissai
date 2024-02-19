import type { PageServerLoad } from "./$types"
import { runQuery } from "$lib/server"

async function getProduct(id: string) {
	const query = `
		SELECT p.name, p.description, p.images, p.product_uri, p.shop_name, JSON_AGG(s.*) AS similar
		FROM 
			products AS p,
			LATERAL (
				SELECT
					id, name, images[1] AS image
				FROM products as p2
				WHERE p.id != p2.id
				ORDER BY p2.embedding <-> p.embedding
				LIMIT 4
			) AS s
		WHERE p.id='${id}'
		GROUP BY p.id;
	`
	const response = await runQuery(query)

	return response[0]
}

export const load: PageServerLoad = async ({ params }) => {
	const product = await getProduct(params.productId)
	return product
}

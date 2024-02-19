import runQuery from "./db"
import Embedder from "./Embedder"

const embedder = Embedder()

async function getDetails(id: string) {
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

async function search(searchQuery: string) {
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

export default { getDetails, search }
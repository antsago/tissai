import type { PageServerLoad } from "./$types"
import type { Embedding } from "$lib/server/embedder"
import pg from "pg"
import Embedder from "$lib/server/embedder"

const embedder = Embedder()

async function getProduct(embedding: Embedding) {
	const pool = new pg.Pool({
		host: "postgres",
		port: 5432,
		user: "postgres",
		password: "postgres",
		database: "postgres",
	})

	const res = await pool.query(`
		SELECT
			id, name, images[1] AS image
		FROM products
		ORDER BY embedding <-> '[${embedding}]'
		LIMIT 20
	`)

	const product = res.rows
	await pool.end()

	return product
}

export const load: PageServerLoad = async ({ url }) => {
	const query = url.searchParams.get("q") || ""
	const concated = await embedder.embed(query)
	const products = await getProduct(concated)

	return {
		products,
	}
}

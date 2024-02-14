import type { PageServerLoad } from "./$types"
import pg from "pg"

async function getProduct(id: string) {
	const pool = new pg.Pool({
		host: "postgres",
		port: 5432,
		user: "postgres",
		password: "postgres",
		database: "postgres",
	})

	const query = `SELECT * FROM products WHERE id='${id}'`
	const res = await pool.query(query)

	await pool.end()

	return res.rows[0]
}

export const load: PageServerLoad = async ({ params }) => {
	const product = await getProduct(params.productId)
	return product
}

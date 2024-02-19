import type { PageServerLoad } from "./$types"
import { PythonShell } from 'python-shell'
import pg from "pg"

async function getProduct(id: string) {
	const pool = new pg.Pool({
		host: "postgres",
		port: 5432,
		user: "postgres",
		password: "postgres",
		database: "postgres",
	})

	const res = await pool.query(`
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
	`)

	const product = res.rows[0]
	await pool.end()

	return product
}

const echo = new PythonShell('echo.py')
echo.on('message', (message) => {
	console.log(message)
})

export const load: PageServerLoad = async ({ params }) => {
	echo.send(params.productId)

	const product = await getProduct(params.productId)
	return product
}

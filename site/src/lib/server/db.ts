import pg from "pg"

export default async function runQuery(query: string) {
	const pool = new pg.Pool({
		host: "postgres",
		port: 5432,
		user: "postgres",
		password: "postgres",
		database: "postgres",
	})

	const res = await pool.query(query)

	const result = res.rows
	await pool.end()

	return result
}

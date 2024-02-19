import pg from "pg"

export type DB = {
	query: (query: string) => Promise<unknown[]>
}

// export default function DB(): DB {
// 	let pool: pg.Pool
	
// 	const runQuery = async (query: string) => {
// 		if (!pool) {
// 			pool = new pg.Pool({
// 				host: "postgres",
// 				port: 5432,
// 				user: "postgres",
// 				password: "postgres",
// 				database: "postgres",
// 			})
// 		}
	
// 		const res = await pool.query(query)
	
// 		const result = res.rows
		
// 		return result
// 	}
// 	// await pool.end()

// 	return {
// 		query: runQuery,
// 	}
// }

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

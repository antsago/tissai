import postgres from "pg"

export type DB = {
	query: <T>(query: string) => Promise<T[]>
}

let pg = postgres
export function DB(): DB {
	const runQuery = async (query: string) => {
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

	return {
		query: runQuery,
	}
}

export function setPg(mockPg: any) {
	pg = mockPg
}

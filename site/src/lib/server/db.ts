import postgres from "pg"

export type DB = {
	query: <T>(query: string) => Promise<T[]>
}

let pg = postgres
export function DB(): DB {
	const pool = new pg.Pool({
		host: "postgres",
		port: 5432,
		user: "postgres",
		password: "postgres",
		database: "postgres",
	})

	const runQuery = async (query: string) => {
		const response = await pool.query(query)
		return response.rows
	}

	return {
		query: runQuery,
	}
}

export function setPg(mockPg: any) {
	pg = mockPg
}

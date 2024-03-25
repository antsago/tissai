import postgres from "pg"

export type DB = {
	query: <T>(query: string) => Promise<T[]>
}

let pg = postgres
export function DB(): DB {
	const pool = new pg.Pool({
		connectionString: process.env.PG_CONNECTION_STRING,
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

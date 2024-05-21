import postgres from "pg"

export type DB = {
	query: <T>(query: string) => Promise<T[]>
}

let pg = postgres
export function DB(): DB {
  const connectionString = `${process.env.PG_CONNECTION_STRING}/${process.env.PG_DATABASE}`
  const pool = new pg.Pool({ connectionString })

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

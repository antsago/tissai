import { Pool as PgPool } from "pg"

let Pool = PgPool
export function setPg(mock: typeof PgPool) {
  Pool = mock
}

export const Db = () => {
  const pool = new Pool()

	const runQuery = async (query: string, values?: any[]) => {
		const response = await pool.query(query, values)
		return response.rows
	}

  return {
    query: runQuery,
  }
}

export type Db = ReturnType<typeof Db>

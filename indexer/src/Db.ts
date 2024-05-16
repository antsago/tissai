import { Pool as PgPool } from "pg"

let Pool = PgPool
export function setPg(mock: typeof PgPool) {
  Pool = mock
}

export const Db = () => {
  const pool = new Pool()

	const runQuery = async (query: string) => {
		const response = await pool.query(query)
		return response.rows
	}

  return {
    query: runQuery,
  }
}

export type Db = ReturnType<typeof Db>

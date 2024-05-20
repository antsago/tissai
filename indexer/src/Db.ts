import { Pool as PgPool } from "pg"
import createInserts from "./createInserts.js"

let Pool = PgPool
export function setPg(mock: typeof PgPool) {
  Pool = mock
}
export type RunQuery = <T>(query: string, values?: any[]) => Promise<T[]>

export const Db = () => {
  const pool = new Pool()

	const runQuery: RunQuery = async (query, values) => {
		const response = await pool.query(query, values)
		return response.rows
	}
  const insert = createInserts(runQuery)

  return {
    query: runQuery,
    insert,
  }
}

export type Db = ReturnType<typeof Db>

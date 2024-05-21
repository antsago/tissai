import { Pool as PgPool } from "pg"
import createInserts from "./createInserts.js"

let Pool = PgPool
export function setPg(mock: typeof PgPool) {
  Pool = mock
}
export type RunQuery = <T>(query: string, values?: any[]) => Promise<T[]>

export const Db = (database?: string) => {
  const connectionString = `${process.env.PG_CONNECTION_STRING}/${database ?? process.env.PG_DATABASE}`
  const pool = new Pool({ connectionString })

	const runQuery: RunQuery = async (query, values) => {
		const response = await pool.query(query, values)
		return response.rows
	}
  const insert = createInserts(runQuery)

  return {
    query: runQuery,
    insert,
    close: () => pool.end(),
  }
}

export type Db = ReturnType<typeof Db>

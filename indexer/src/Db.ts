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
  const createTracesTable = () => runQuery(`
    CREATE TABLE traces (
      id              uuid PRIMARY KEY,
      timestamp       timestamp with time zone,
      page_of_origin  uuid,
      object_table    text,
      object_id       text
    );`
  )
  const createSellersTable = () => runQuery(`
    CREATE TABLE sellers (
      name            text PRIMARY KEY
    );`
  )

  return {
    query: runQuery,
    close: () => pool.end(),
    insert,
    createTracesTable,
    createSellersTable,
  }
}

export type Db = ReturnType<typeof Db>

import { Pool as PgPool } from "pg"

let Pool = PgPool
export function setPg(mock: typeof PgPool) {
  Pool = mock
}

const Connection = (database?: string) => {
  const connectionString = `${process.env.PG_CONNECTION_STRING}/${database ?? process.env.PG_DATABASE}`
  const pool = new Pool({ connectionString })

	const runQuery = async (query: string, values?: any[]) => {
		const response = await pool.query(query, values)
		return response.rows
	}

  return {
    query: runQuery,
    close: () => pool.end(),
  }
}
export type Connection = ReturnType<typeof Connection>

export default Connection

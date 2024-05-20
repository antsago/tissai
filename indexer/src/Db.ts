import { randomUUID } from "node:crypto"
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

  const insertTrace = (pageId: string, objectTable: string, objectId: string) =>
    runQuery(`INSERT INTO trazes (
      id, timestamp, page_of_origin, object_table, object_id
    ) VALUES (
      $1, CURRENT_TIMESTAMP, $2, $3, $4
    );`, [
      randomUUID(),
      pageId,
      objectTable,
      objectId,
    ])

  return {
    query: runQuery,
    insertTrace,
  }
}

export type Db = ReturnType<typeof Db>

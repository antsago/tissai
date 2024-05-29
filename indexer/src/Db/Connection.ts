import { default as pg, QueryResultRow } from "pg"
import PgCursor from "pg-cursor"

let { Pool } = pg
let Cursor = PgCursor
export function setPg(pool: typeof pg.Pool, cursor: typeof PgCursor) {
  Pool = pool
  Cursor = cursor
}

export const Connection = (database?: string) => {
  const connectionString = `${process.env.PG_CONNECTION_STRING}/${database ?? process.env.PG_DATABASE}`
  const pool = new Pool({ connectionString })

  async function query<T extends QueryResultRow>(
    queryString: string,
    values?: any[],
  ) {
    const response = await pool.query<T, any[]>(queryString, values)
    return response.rows
  }

  const ONE_ROW = 1
  async function* stream<T extends QueryResultRow>(
    queryString: string,
    values?: any[],
  ) {
    const client = await pool.connect()
    const cursor = await client.query<PgCursor<T>>(
      new Cursor(queryString, values),
    )

    let rows = await cursor.read(ONE_ROW)
    while (rows.length >= 1) {
      yield rows[0]
      rows = await cursor.read(ONE_ROW)
    }

    await cursor.close()
    await client.release()
  }

  return {
    query,
    stream,
    close: () => pool.end(),
  }
}

export type Connection = ReturnType<typeof Connection>

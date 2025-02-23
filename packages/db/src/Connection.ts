import { CompiledQuery } from "kysely"
import { default as pg, type PoolConfig, QueryResultRow } from "pg"
import PgCursor from "pg-cursor"

pg.types.setTypeParser(pg.types.builtins.NUMERIC, (val: string) =>
  parseFloat(val),
)

let { Pool } = pg
let Cursor = PgCursor
export function setPg(pool: typeof pg.Pool, cursor: typeof PgCursor) {
  Pool = pool
  Cursor = cursor
}

export const Connection = (
  database?: string,
  config?: Omit<PoolConfig, "connectionString">,
) => {
  const connectionString = `${process.env.PG_CONNECTION_STRING}/${database ?? process.env.PG_DATABASE}`
  const pool = new Pool({ ...config, connectionString })

  async function raw<T extends QueryResultRow>(
    queryString: string,
    values?: any[],
  ) {
    const response = await pool.query<T, any[]>(queryString, values)
    return response.rows
  }

  async function query<T extends QueryResultRow>(query: CompiledQuery<T>) {
    return raw<T>(query.sql, query.parameters as any[])
  }

  const ONE_ROW = 1
  async function* stream<T extends QueryResultRow>(query: CompiledQuery<T>) {
    const client = await pool.connect()
    const cursor = await client.query<PgCursor<T>>(
      new Cursor(query.sql, query.parameters as any[]),
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
    raw,
    query,
    stream,
    close: () => pool.end(),
  }
}

export type Connection = ReturnType<typeof Connection>

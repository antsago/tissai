import type { Database } from "../types.js"
import {
  sql,
  RawBuilder,
  DummyDriver,
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from "kysely"

export function toJsonb<T>(value: RawBuilder<T>): RawBuilder<T> {
  return sql<T>`to_jsonb(${value})`
}

const builder = new Kysely<Database>({
  dialect: {
    createAdapter: () => new PostgresAdapter(),
    createDriver: () => new DummyDriver(),
    createIntrospector: (db) => new PostgresIntrospector(db),
    createQueryCompiler: () => new PostgresQueryCompiler(),
  },
})

export default builder

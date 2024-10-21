import type { Database } from "../tables.js"
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

type ToTable<T> = {
  [K in keyof Required<T>]: undefined extends T[K]
    ? Exclude<T[K], undefined> | null
    : T[K]
}
type ToTables<D> = {
  [K in keyof D]: ToTable<D[K]>
}

const builder = new Kysely<ToTables<Database>>({
  dialect: {
    createAdapter: () => new PostgresAdapter(),
    createDriver: () => new DummyDriver(),
    createIntrospector: (db) => new PostgresIntrospector(db),
    createQueryCompiler: () => new PostgresQueryCompiler(),
  },
})

export default builder

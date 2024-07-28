import { Connection } from "../Connection.js"
import builder, { type Brand } from "./queryBuilder.js"

export const TABLE = Object.assign("brands", {
  name: "name",
  logo: "logo",
})

export const initialize = (connection: Connection) =>
  connection.raw(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      ${TABLE.name}   text PRIMARY KEY,
      ${TABLE.logo}   text
    );
  `)

export const queries = {
  create: (brand: Brand) => builder.insertInto("brands").values(brand).compile(),
  getAll: () => builder.selectFrom("brands").selectAll().compile(),
  byName: (name: string) => builder
      .selectFrom("brands")
      .selectAll()
      .where(
        ({ fn, val }) => fn<number>("similarity", ["name", val(name)]),
        ">=",
        1,
      )
      .limit(1)
      .compile(),
  update: (brand: Brand) =>builder
    .updateTable("brands")
    .set(brand)
    .where("name", "=", brand.name)
    .compile(),
}
export const crud = (connection: Connection) => ({
  create: (brand: Brand) =>
    connection.query(queries.create(brand)),
  getAll: async () =>
    connection.query(queries.getAll()),
  byName: async (name: string) => {
    const [found] = await connection.query(queries.byName(name))
    return found
  },
  update: async (brand: Brand) =>
    connection.query(queries.update(brand)),
})

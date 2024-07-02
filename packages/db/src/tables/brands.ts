import { Connection } from "../Connection.js"
import builder from "./queryBuilder.js"

export type Brand = {
  name: string
  logo?: string
}

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

export const crud = (connection: Connection) => ({
  create: (brand: Brand) =>
    connection.raw(
      `INSERT INTO ${TABLE}
        (${TABLE.name}, ${TABLE.logo}) VALUES ($1, $2)
      ON CONFLICT DO NOTHING;`,
      [brand.name, brand.logo],
    ),
  getAll: async () => connection.raw<Brand>(`SELECT * FROM ${TABLE};`),
  byName: async (name: string) => {
    const query = builder
      .selectFrom("brands")
      .selectAll()
      .where(
        ({ fn, val }) => fn<number>("similarity", ["name", val(name)]),
        ">=",
        1,
      )
      .limit(1)
      .compile()
    const [found] = await connection.query(query)
    return found
  },
  update: async (brand: Brand) =>
    connection.query(
      builder
        .updateTable("brands")
        .set(brand)
        .where("name", "=", brand.name)
        .compile(),
    ),
})

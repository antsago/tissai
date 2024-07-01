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
  connection.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      ${TABLE.name}   text PRIMARY KEY,
      ${TABLE.logo}   text
    );
  `)

export const crud = (connection: Connection) => ({
  create: (brand: Brand) =>
    connection.query(
      `INSERT INTO ${TABLE}
        (${TABLE.name}, ${TABLE.logo}) VALUES ($1, $2)
      ON CONFLICT DO NOTHING;`,
      [brand.name, brand.logo],
    ),
  getAll: async () => connection.query<Brand>(`SELECT * FROM ${TABLE};`),
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
    const [found] = await connection.query<Brand>(
      query.sql,
      query.parameters as any[],
    )
    return found
  },
  update: async (brand: Brand) =>
    connection.query("UPDATE brands SET logo = $2 WHERE name = $1", [
      brand.name,
      brand.logo,
    ]),
})

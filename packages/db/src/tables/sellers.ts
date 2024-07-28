import { Connection } from "../Connection.js"
import builder, { type Seller } from "./queryBuilder.js"

export const TABLE = Object.assign("sellers", {
  name: "name",
})

export const initialize = (connection: Connection) =>
  connection.raw(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      ${TABLE.name}   text PRIMARY KEY
    );`)

export const queries = {
  create: (seller: Seller) =>
    builder
      .insertInto("sellers")
      .onConflict((oc) => oc.doNothing())
      .values(seller)
      .compile(),
  getAll: () => builder.selectFrom("sellers").selectAll().compile(),
}

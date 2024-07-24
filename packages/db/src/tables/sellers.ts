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

export const crud = (connection: Connection) => ({
  create: (seller: Seller) =>
    connection.query(
      builder
        .insertInto("sellers")
        .onConflict((oc) => oc.doNothing())
        .values(seller)
        .compile(),
    ),

  getAll: async () =>
    connection.query(builder.selectFrom("sellers").selectAll().compile()),
})

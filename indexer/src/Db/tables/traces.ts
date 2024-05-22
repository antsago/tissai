import { randomUUID } from "node:crypto"
import { Connection } from "../Connection.js"

export const TABLE = Object.assign("traces", {
  id: "id",
  timestamp: "timestamp",
  pageId: "page_of_origin",
  objectTable: "object_table",
  objectId: "object_id",
})

export const create =
  (connection: Connection) =>
  (pageId: string, objectTable: string, objectId: string) =>
    connection.query(
      `INSERT INTO ${TABLE} (
      ${TABLE.id}, ${TABLE.timestamp}, ${TABLE.pageId}, ${TABLE.objectTable}, ${TABLE.objectId}
    ) VALUES (
      $1, CURRENT_TIMESTAMP, $2, $3, $4
    );`,
      [randomUUID(), pageId, objectTable, objectId],
    )

export const initialize = (connection: Connection) =>
  connection.query(`
    CREATE TABLE ${TABLE} (
      ${TABLE.id}             uuid PRIMARY KEY,
      ${TABLE.timestamp}      timestamp with time zone,
      ${TABLE.pageId}         uuid,
      ${TABLE.objectTable}    text,
      ${TABLE.objectId}       text
    );`)

import { Connection } from "../Connection.js"

export const SCHEMAS = Object.assign("schemas", {
  category: "category",
  label: "label",
  value: "value",
  tally: "tally",
})

export const initialize = (connection: Connection) =>
  connection.raw(`
    CREATE TABLE IF NOT EXISTS ${SCHEMAS} (
      ${SCHEMAS.category}       text NOT NULL,
      ${SCHEMAS.label}          text NOT NULL,
      ${SCHEMAS.value}          text NOT NULL,
      ${SCHEMAS.tally}          numeric NOT NULL,
      UNIQUE (${SCHEMAS.category}, ${SCHEMAS.label}, ${SCHEMAS.value})
    );
  `)

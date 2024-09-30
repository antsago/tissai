import { Connection } from "../Connection.js"

export const NODES = Object.assign("nodes", {
  id: "id",
  name: "name",
  parent: "parent",
  tally: "tally",
})

export const initialize = (connection: Connection) =>
  connection.raw(`
    CREATE TABLE IF NOT EXISTS ${NODES} (
      ${NODES.id}             uuid PRIMARY KEY,
      ${NODES.parent}         uuid REFERENCES ${NODES}(id),
      ${NODES.name}           text NOT NULL,
      ${NODES.tally}          numeric NOT NULL,
      UNIQUE (${NODES.parent}, ${NODES.name})
    );
  `)

import type { TableNames, Database } from "../../types.js"
import builder from "../builder.js"

function sharedQueries<Table extends Database[TableNames]>(table: TableNames) {
  return {
    create: (entity: Table) =>
      builder.insertInto(table).values(entity).compile(),
    getAll: () => builder.selectFrom(table).selectAll().compile(),
  }
}

export default sharedQueries

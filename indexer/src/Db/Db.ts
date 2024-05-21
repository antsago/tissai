import { Connection } from "./Connection.js"
import * as traces from "./traces.js"
import * as sellers from "./sellers.js"
import * as brands from "./brands.js"
import * as categories from "./categories.js"
import * as tags from "./tags.js"
import * as products from "./products.js"
import * as offers from "./offers.js"

export const Db = (database?: string) => {
  const connection = Connection(database)

  const initialize = async () => {
    await connection.query("CREATE EXTENSION vector;")
    await Promise.all([
      traces.initialize(connection),
      sellers.initialize(connection),
      brands.initialize(connection),
      categories.initialize(connection),
      tags.initialize(connection),
      products.initialize(connection),
      offers.initialize(connection),
    ])
  }
  const insert = {
    trace: traces.create(connection),
    seller: sellers.create(connection),
    brand: brands.create(connection),
    category: categories.create(connection),
    tag: tags.create(connection),
    product: products.create(connection),
    offer: offers.create(connection),
  }

  return {
    ...connection,
    insert,
    initialize,
  }
}

export type Db = ReturnType<typeof Db>

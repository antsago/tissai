import { Connection } from "./Connection.js"
import * as traces from "./traces.js"
import * as sellers from "./sellers.js"
import * as brands from "./brands.js"
import * as categories from "./categories.js"
import * as tags from "./tags.js"
import * as products from "./products.js"
import * as offers from "./offers.js"

function createInserts(connection: Connection) {
  const insertTrace = traces.create(connection)
  const insertSeller = sellers.create(connection)
  const insertBrand = brands.create(connection)
  const insertCategory = categories.create(connection)
  const insertTag = tags.create(connection)
  const insertProduct = products.create(connection)
  const insertOffer = offers.create(connection)

  return {
    trace: insertTrace,
    seller: insertSeller,
    brand: insertBrand,
    category: insertCategory,
    tag: insertTag,
    product: insertProduct,
    offer: insertOffer,
  }
}

export default createInserts

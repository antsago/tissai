import { Connection } from "./Connection.js"
import initialize from "./initializeDb/index.js"
import { executors } from "./queries/index.js"
import searchProducts from "./searchProducts.js"
import getProductDetails from "./getProductDetails.js"

export const Db = (database?: string) => {
  const connection = Connection(database)

  return {
    ...connection,
    ...executors(connection),
    initialize: () => initialize(connection),
    searchProducts: searchProducts(connection),
    getProductDetails: getProductDetails(connection),
  }
}

export type Db = ReturnType<typeof Db>

import type {
  Brand,
  Category,
  Product,
  Tag,
  Offer,
  Seller,
  Page,
} from "@tissai/db"
import type { JsonLD } from "../jsonLd.js"
import type { OpenGraph } from "../opengraph.js"
import type { Headings } from "../headings.js"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import _ from "lodash"
import { PythonPool } from "@tissai/python-pool"
import { reporter } from "../Reporter.js"
import title from "./title.js"
import brand from "./brand.js"
import sellers from "./sellers.js"
import category from "./category.js"
import tags from "./tags.js"
import product from "./product.js"
import offers from "./offers.js"

type Entities = {
  product: Product
  category: Category
  brand?: Brand
  tags: Tag[]
  offers: Offer[]
  sellers: Seller[]
}
export const EntityExtractor = () => {
  const currentDirectory = dirname(fileURLToPath(import.meta.url))
  const python = PythonPool<
    string,
    { embedding: number[]; category: string; tags: string[] }
  >(`${currentDirectory}/parseTitle.py`, reporter)

  return {
    close: () => python.close(),
    extract: async (
      sd: {
        jsonLd: JsonLD
        opengraph: OpenGraph
        headings: Headings
      },
      page: Page,
    ): Promise<Entities> => {
      const jsonLdInfo = sd.jsonLd
      const opengraph = sd.opengraph
      const headingInfo = sd.headings
      const productTitle = title(jsonLdInfo, opengraph, headingInfo)

      if (!productTitle) {
        throw new Error("Product without title!")
      }

      const categoryEntity = await category(productTitle, python)
      const tagEntities = await tags(productTitle, python)
      const sellerEntities = sellers(jsonLdInfo)
      const brandEntity = brand(jsonLdInfo)
      const productEntity = await product(
        jsonLdInfo,
        headingInfo,
        opengraph,
        productTitle,
        python,
        categoryEntity,
        tagEntities,
        brandEntity,
      )
      const offerEntities = offers(jsonLdInfo, page, productEntity)

      return {
        category: categoryEntity,
        tags: tagEntities,
        brand: brandEntity,
        product: productEntity,
        offers: offerEntities,
        sellers: sellerEntities,
      }
    },
  }
}

export type EntityExtractor = ReturnType<typeof EntityExtractor>

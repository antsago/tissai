import _ from "lodash"
import { randomUUID } from "crypto"
import {
  Compiler,
  Id,
  NonMatch,
  Type,
  type GenericEntity,
} from "../parser/index.js"
import { Helpers, PageServer } from "../PageServer/index.js"
import { getSchemas, ProductType } from "./schemas.js"
import { brand } from "./brand.js"
import seller from "./seller.js"
import attribute from "./attribute.js"
import { Page, query } from "@tissai/db"

const createStream = async ({ db }: Helpers<Compiler>) => {
  const baseQuery = query.selectFrom("pages")
  const [{ total }] = await db.query(
    baseQuery.select(({ fn }) => fn.count("id").as("total")).compile(),
  )
  const pages = db.stream<Page>(baseQuery.selectAll().compile())

  return { total: total as number, pages }
}

await new PageServer<Compiler>(createStream)
  .with(() => {
    const compiler = Compiler(getSchemas)

    return [compiler, () => compiler.close()]
  })
  .onPage(async (page, { compiler, db }) => {
    const entities = await compiler.parse(page.body)

    if (entities !== NonMatch) {
      const entityMap = entities.reduce(
        (eMap, e) => ({ ...eMap, [e[Id]]: e }),
        {},
      ) as Record<string, GenericEntity>
      await Promise.all(
        entities
          .filter((e) => e[Type] === ProductType && !!e.title)
          .map(async (product) => {
            const productBrand =
              product.brand &&
              (await brand(entityMap[product.brand[0][Id]] as any, db))

            await db.products.create({
              id: product[Id],
              title: product.title[0],
              description: product.description?.[0],
              images: product.images,
              brand: productBrand?.name,
            })

            await Promise.all(
              product.attributes[0]
                .filter((att: any) => "value" in att)
                .map((att: any) => attribute(att, product[Id], db)),
            )

            const productOffers = product.offers
              ?.map((offerReference) => entityMap[offerReference[Id]])
              .filter((offer) => !!offer)

            const normalizedOffers = !productOffers?.length
              ? [{} as any]
              : await Promise.all(
                  productOffers.map(async (offer) => {
                    const offerSeller =
                      offer.seller &&
                      (await seller(entityMap[offer.seller[0][Id]] as any, db))

                    return {
                      price: offer.price?.[0],
                      currency: offer.currency?.[0],
                      seller: offerSeller?.name,
                    }
                  }),
                )

            await Promise.all(
              _.uniqWith(normalizedOffers, _.isEqual).map((offer) =>
                db.offers.create({
                  id: randomUUID(),
                  product: product[Id],
                  site: page.site,
                  url: page.url,
                  currency: offer.currency,
                  price: offer.price,
                  seller: offer.seller,
                }),
              ),
            )
          }),
      )
    }
  })
  .start()

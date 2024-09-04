import { Brand, Seller } from "@tissai/db"
import _ from "lodash"
import { randomUUID } from "crypto"
import { Compiler, Id, NonMatch, Type, type GenericEntity } from "../parser/index.js"
import { PageServer } from "../PageServer.js"
import { getSchemas, ProductType } from "./schemas.js"
import { brand } from "./brand.js"
import seller from "./seller.js"

await new PageServer<{ compiler: Compiler }>()
  .onInitialize(() => ({ compiler: Compiler(getSchemas) }))
  .onClose(async ({ compiler }) => compiler?.close())
  .onPage(async (page, { compiler, db }) => {
    const entities = await compiler.parse(page.body)

    if (entities !== NonMatch) {
      const entityMap = entities.reduce((eMap, e) => ({ ...eMap, [e[Id]]: e }), {}) as Record<string, GenericEntity>
      await Promise.all(entities.filter(e => e[Type] === ProductType && !!e.title)
        .map(async product => {
          const productBrand = await brand(entityMap[product.brand[0][Id]] as any, db)

          await db.products.create({
            id: product[Id],
            title: product.title[0],
            description: product.description?.[0],
            images: product.images,
            brand: productBrand?.name,
          })

          await Promise.all(product.attributes[0]
            .filter((att: any) => "value" in att)
            .map(async ({ key, value}: any) => 
              db.attributes.create({
                id: randomUUID(),
                product: product[Id],
                label: key,
                value,
              })
            )
          )

          const normalizedOffers = await Promise.all(product.offers?.map(offerReference => entityMap[offerReference[Id]])
          .filter(offer => !!offer)
          .map(async offer => {
            const sellerCandidate = offer.seller && entityMap[offer.seller[0][Id]]
            const offerSeller = sellerCandidate?.name && await seller({ name: sellerCandidate.name[0] }, db)

            return {
              price: offer.price?.[0],
              currency: offer.currency?.[0],
              seller: offerSeller?.name,
            }
          }))

          await Promise.all(_.uniqWith(normalizedOffers, _.isEqual).map(offer => db.offers.create({
            id: randomUUID(),
            product: product[Id],
            site: page.site,
            url: page.url,
            currency: offer.currency,
            price: offer.price,
            seller: offer.seller,
          })))
        }))
    }
  })
  .start()

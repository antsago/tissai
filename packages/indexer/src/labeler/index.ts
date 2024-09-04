import { BrandType, getSchemas, ProductType, SellerType } from "./schemas.js"
import { Compiler, Id, NonMatch, Type } from "../parser/index.js"
import { PageServer } from "../PageServer.js"
// import { brand, brand } from "./brand.js"
import seller from "./seller.js"

let result = [] as any[]

await new PageServer<{ compiler: Compiler }>()
  .onInitialize(() => ({ compiler: Compiler(getSchemas) }))
  .onClose(async ({ compiler }) => compiler?.close())
  .onPage(async (page, { compiler, db }) => {
    const entities = await compiler.parse(page.body)

    if (entities !== NonMatch) {
      // const entityMap = entities.reduce((eMap, e) => ({ ...eMap, [e.Id]: e }), {}) as Record<string, any>
      // entities.filter(e => e[Type] === ProductType && !e.title)
        // .map(async product => {
        //   const brandCandidate = product.brand && entityMap[product.brand[Id]]
        //   const productBrand = brandCandidate?.name ? await brand(brandCandidate, db) : undefined

        //   await db.products.create({
        //     id: product[Id],
        //     title: product.title,
        //     description: product.description,
        //     images: product.images && !Array.isArray(product.images) ? [product.images] : product.images,
        //     brand: productBrand?.name,
        //   })

        //   const productOffers = product.offers && !Array.isArray(product.offers) ? [product.offers] : product.offers

        //   productOffers.map(offer => {
        //     const sellerCandidate = 
        //   })
        // })
      // await Promise.all(
      //   entities.map(async (e) => {
      //     switch (e[Type]) {
      //       case BrandType:
      //         return brand(e, db)
      //       case SellerType:
      //         return seller(e, db)
      //       default:
      //         return
      //     }
      //   }),
      // )

      result = result.concat(entities)
    }
  })
  .start()

console.dir(result, { depth: null })

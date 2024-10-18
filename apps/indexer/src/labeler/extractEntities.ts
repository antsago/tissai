import { randomUUID } from "node:crypto"
import _ from "lodash"
import type { Db } from "@tissai/db"
import { type ParsedInfo } from "../trainer/parsePage/index.js"
import { infer } from "./interpretations/infer.js"
import { type Tokenizer } from "@tissai/tokenizer"

export async function extractEntities(
  info: ParsedInfo,
  tokenizer: Tokenizer,
  db: Db,
) {
  if (!info.title) {
    throw new Error("No title found")
  }

  const words = await tokenizer.fromText(info.title)

  const interpretation = await infer(
    words.map((w) => w.text),
    db,
  )

  const brand = info.brandName
    ? {
        name: info.brandName.toLocaleLowerCase(),
        logo: info.brandLogo,
      }
    : undefined

  const product = {
    id: randomUUID() as string,
    title: info.title,
    description: info.description,
    images: info.images,
    category: interpretation.category,
  }

  const offers = _.uniqWith(
    info.offers?.map((offer) => ({
      ...offer,
      seller: offer.seller?.toLocaleLowerCase(),
    })),
    _.isEqual,
  )

  return {
    brand,
    product,
    attributes: interpretation.attributes,
    offers,
  }
}

export type Entities = Awaited<ReturnType<typeof extractEntities>>

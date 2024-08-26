import { randomUUID } from "node:crypto"
import { TokenReader } from "./TokenReader.js"
import mapping from "./mapping.js"
import { Compiler } from "./Compiler.js"
import {
  Equals,
  ValueSeparator,
  PropertyEnd,
  Ontology,
  Attributes,
  EntityStart,
  EntityEnd,
  PropertyStart,
  Id,
  Required,
} from "./grammar/index.js"
import { EntityToken } from "./types.js"
import { expandEntry } from "../jsonLd.js"

type Expanded = {
  [key: string]: (string | number | boolean)[]
}

const tokenizeJson = (json: any): EntityToken[] => {
  let tokens = [] as EntityToken[]
  const extractEntity = (entityObject: any) => {
    const entityId = randomUUID()
    const tokensForEntity = [
      EntityStart,
      entityId,
      Object.entries(expandEntry(entityObject) as Expanded).map(([key, values]) => [
        PropertyStart,
        key,
        Equals,
        values
          .map((value) => [
            typeof(value) === "object" ? [Id, extractEntity(value)] : value,
            ValueSeparator])
          .flat()
          .slice(0, -1),
        PropertyEnd,
      ]),
      EntityEnd,
    ].flat(Infinity) as EntityToken[]

    tokens = tokens.concat(tokensForEntity)
    return entityId
  }

  extractEntity(json)

  return tokens
}

const ProductLd = {
  "@context": "https://schema.org/",
  "@type": "Product",
  name: "The name of the product",
  productID: "121230",
  description: "The description",
  image: ["https://example.com/image.jpg","https://example.com/image2.jpg", 2],
  brand: {
    "@type": "Brand",
    name: "WEDZE",
    image: ["https://brand.com/image.jpg"],
  },
}

const reader = TokenReader(tokenizeJson(ProductLd))
const compiler = await Compiler(mapping)

const Product = Ontology([
  {
    [Required]: {
      key: "@type",
      value: "Product",
    },
    title: {
      name: "name",
      parse: {
        as: "attributes",
        with: compiler.compile(Attributes),
      },
    },
    brand: {
      name: "brand",
      isReference: true,
    },
    description: "description",
    images: "image",
  },
  {
    [Required]: {
      key: "@type",
      value: "Brand",
    },
    name: "name",
    icon: "image",
  },
])

const result = await Product(reader)

await compiler.close()
console.dir(result, { depth: null })

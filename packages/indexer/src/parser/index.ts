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

type LD = {
  [key: string]: string | string[]
}
type Expanded = {
  [key: string]: string[]
}

const tokenizeJson = (json: LD): EntityToken[] =>
  [
    EntityStart,
    "enitity-0",
    Object.entries(expandEntry(json) as Expanded).map(([key, values]) => [
      PropertyStart,
      key,
      Equals,
      values
        .map((value) => [value, ValueSeparator])
        .flat()
        .slice(0, -1),
      PropertyEnd,
    ]),
    EntityEnd,
  ].flat(3)

const ProductLd = {
  // "@context": "https://schema.org/",
  // "@type": "Product",
  // name: "The name of the product",
  productID: "121230",
  // description: "The description",
  image: ["https://example.com/image.jpg","https://example.com/image2.jpg"]
  // brand: {
  //   "@type": "Brand",
  //   name: "WEDZE",
  //   image: ["https://brand.com/image.jpg"],
  // },
}

const tokens = tokenizeJson(ProductLd)
console.dir(tokens, { depth: null })

// const TokenizedLd = [
//   EntityStart,
//   "entity-0",
//   PropertyStart,
//   "@type",
//   Equals,
//   "Product",
//   PropertyEnd,
//   PropertyStart,
//   "name",
//   Equals,
//   "The name of the product",
//   PropertyEnd,
//   PropertyStart,
//   "description",
//   Equals,
//   "The description",
//   PropertyEnd,
//   PropertyStart,
//   "image",
//   Equals,
//   "https://example.com/image.jpg",
//   ValueSeparator,
//   "https://example.com/image2.jpg",
//   PropertyEnd,
//   PropertyStart,
//   "brand",
//   Equals,
//   Id,
//   "entity-1",
//   PropertyEnd,
//   EntityEnd,
//   EntityStart,
//   "entity-1",
//   PropertyStart,
//   "@type",
//   Equals,
//   "Brand",
//   PropertyEnd,
//   PropertyStart,
//   "name",
//   Equals,
//   "WEDZE",
//   PropertyEnd,
//   PropertyStart,
//   "image",
//   Equals,
//   "https://brand.com/image.jpg",
//   PropertyEnd,
//   EntityEnd,
// ]

// const reader = TokenReader(TokenizedLd)
// const compiler = await Compiler(mapping)

// const Product = Ontology([
//   {
//     [Required]: {
//       key: "@type",
//       value: "Product",
//     },
//     title: {
//       name: "name",
//       parse: {
//         as: "attributes",
//         with: compiler.compile(Attributes),
//       },
//     },
//     brand: {
//       name: "brand",
//       isReference: true,
//     },
//     description: "description",
//     images: "image",
//   },
//   {
//     [Required]: {
//       key: "@type",
//       value: "Brand",
//     },
//     name: "name",
//     icon: "image",
//   },
// ])

// const result = await Product(reader)

// await compiler.close()
// console.dir(result, { depth: null })

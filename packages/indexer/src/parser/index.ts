import { TokenReader } from "./TokenReader.js"
import mapping from "./mapping.js"
import { Compiler } from "./Compiler.js"
import {
  Equals,
  ValueSeparator,
  PropertyEnd,
  Entity,
  Attributes,
  EntityStart,
  EntityEnd,
  PropertyStart,
} from "./grammar/index.js"

const ProductLd = {
  "@context": "https://schema.org/",
  "@type": "Product",
  name: "The name of the product",
  productID: "121230",
  description: "The description",
  image: "https://example.com/image.jpg",
  brand: {
    "@type": "Brand",
    name: "WEDZE",
    image: ["https://brand.com/image.jpg"],
  },
}

const TokenizedLd = [
  EntityStart,
  PropertyStart,
  "@type",
  Equals,
  "Product",
  PropertyEnd,
  PropertyStart,
  "name",
  Equals,
  "The name of the product",
  PropertyEnd,
  PropertyStart,
  "description",
  Equals,
  "The description",
  PropertyEnd,
  PropertyStart,
  "image",
  Equals,
  "https://example.com/image.jpg",
  ValueSeparator,
  "https://example.com/image2.jpg",
  PropertyEnd,
  // PropertyStart,
  // "brand",
  // Equals,
  // EntityStart,
  // "@type",
  // Equals,
  // "Brand",
  // PropertyEnd,
  // PropertyStart,
  // "name",
  // Equals,
  // "WEDZE",
  // PropertyEnd,
  // PropertyStart,
  // "image",
  // Equals,
  // "https://brand.com/image.jpg",
  // PropertyEnd,
  // EntityEnd,
  // PropertyEnd,
  EntityEnd,
]

const reader = TokenReader(TokenizedLd)
const compiler = await Compiler(mapping)

const Product = Entity({
  title: {
    name: "name",
    parse: {
      as: "attributes",
      with: compiler.compile(Attributes),
    },
  },
  description: "description",
  images: "image",
})

const result = await Product(reader)

await compiler.close()
console.dir(result, { depth: null })

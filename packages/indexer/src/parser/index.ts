import { TokenReader } from "./TokenReader.js"
import mapping from "./mapping.js"
import { Compiler } from "./Compiler.js"
import {
  Grammar,
  Equals,
  ValueSeparator,
  PropertyEnd,
} from "./grammar/index.js"

const PRODUCT_SCHEMA = {
  "@context": "https://schema.org/",
  "@type": "Product",
  name: "The name of the product",
  productID: "121230",
  description: "The description",
  image: "https://example.com/image.jpg",
}

const ProductTokens = [
  // "type", Equals, "Product", PropertyEnd,
  "name",
  Equals,
  "The name of the product",
  PropertyEnd,
  "description",
  Equals,
  "The description",
  PropertyEnd,
  "image",
  Equals,
  "https://example.com/image.jpg",
  ValueSeparator,
  "https://example.com/image2.jpg",
  PropertyEnd,
]

const reader = TokenReader(ProductTokens)
const compiler = await Compiler(mapping)

const result = await Grammar(compiler.compile)(reader)

await compiler.close()
console.dir(result, { depth: null })

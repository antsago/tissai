import { Attributes } from "./grammar/index.js"
import { TokenReader } from "./TokenReader.js"
import mapping from "./mapping.js"
import Lexer, { type Token as LexerToken } from "../lexer/index.js"

const labeler = (tokens: LexerToken[]) =>
  tokens.map((t) => ({
    ...t,
    labels: t.isMeaningful ? Object.keys(mapping[t.text]) : ["filler"],
  }))

async function compileAttributes(title: string) {
  const lexer = Lexer()

  const tokens = await lexer.tokenize(title)
  const labeled = labeler(tokens)
  const attributes = Attributes(TokenReader(labeled))

  await lexer.close()
  
  return attributes
}

const attributes = compileAttributes("Pantalones esquí y nieve con CREMALLERA")
console.dir(attributes, { depth: null })

import { and, any, or, withL } from "./operators/index.js"

const Equals = Symbol('Key-Value assignment')
const ValueSeparator = Symbol('Value separator')
const PropertyEnd = Symbol('Property end')

const IsSymbol = (symbol: symbol) => (reader: TokenReader<string|symbol>) => {
  const nextToken = reader.get()
  if (nextToken && nextToken === symbol) {
    reader.next()
    return nextToken
  }

  return null
}
const IsString = (token?: string) => (reader: TokenReader<string | symbol>) => {
  const nextToken = reader.get()
  if (nextToken && typeof nextToken !== 'symbol' && nextToken === token) {
    reader.next()
    return nextToken
  }

  return null
}

const EQ = IsSymbol(Equals)
const VS = IsSymbol(ValueSeparator)
const PE = IsSymbol(PropertyEnd)
const ArrayValue = and(IsString(), any(and(VS, IsString())), PE)
const Property = (key: string) => and(IsString(key), EQ, ArrayValue)
const TitleValue = and(Attributes, PE)
const Title = and(IsString('name'), EQ, TitleValue)
const Product = any(or(Title, Property('description'), Property("image")))

const PRODUCT_SCHEMA = {
  "@context": "https://schema.org/",
  "@type": "Product",
  name: "The name of the product",
  productID: "121230",
  description: "The description",
  image: "https://example.com/image.jpg",
}
const ProductTokens = [
  "type", Equals, "Product", PropertyEnd,
  "name", Equals, "The name of the product", PropertyEnd,
  "description", Equals, "The description", PropertyEnd,
  "image", Equals, "https://example.com/image.jpg", ValueSeparator, "https://example.com/image2.jpg", PropertyEnd,
]
const reader = TokenReader(ProductTokens)
const result = Product(reader)
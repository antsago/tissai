import { Attributes } from "./grammar/index.js"
import { TokenReader, type WordToken, type EntityToken } from "./TokenReader.js"
import mapping from "./mapping.js"
import Lexer, { type Token as LexerToken } from "../lexer/index.js"
import { Rule } from "./operators/Rule.js"

const labeler = (tokens: LexerToken[]) =>
  tokens.map((t) => ({
    ...t,
    labels: t.isMeaningful && t.text in mapping? Object.keys(mapping[t.text]) : ["filler"],
  }))

const compile = <Output>(check: Rule<WordToken, Output>) => async (title: string) => {
  const lexer = Lexer()

  const tokens = await lexer.tokenize(title)
  const labeled = labeler(tokens)
  const match = await check(TokenReader(labeled))

  await lexer.close()
  
  return match
}

// const attributes = await compile(Attributes)("Pantalones esquí y nieve con CREMALLERA")
// console.dir(attributes, { depth: null })

import { and, any, or, IsSymbol } from "./operators/index.js"

const Equals = Symbol('Key-Value assignment')
const ValueSeparator = Symbol('Value separator')
const PropertyEnd = Symbol('Property end')

const IsString = (token?: string) => (reader: TokenReader<EntityToken>) => {
  const nextToken = reader.get()
  if (nextToken && typeof nextToken !== 'symbol' && (token === undefined || nextToken === token)) {
    reader.next()
    return nextToken
  }

  return null
}
const deeplyParsed = <Output>(check: Rule<WordToken, Output>) => async (reader: TokenReader<EntityToken>) => {
  const nextToken = reader.get()
  
  if (!nextToken || typeof nextToken === 'symbol') {
    return null
  }

  const match = await compile(check)(nextToken)
  if (match === null) {
    return null
  }

  reader.next()
  return match
}

const EQ = IsSymbol(Equals)
const VS = IsSymbol(ValueSeparator)
const PE = IsSymbol(PropertyEnd)
const ArrayValue = and(IsString(), any(and(VS, IsString())), PE)
const Property = (key: string) => and(IsString(key), EQ, ArrayValue)
const Title = and(IsString('name'), EQ, deeplyParsed(Attributes), PE)
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
  // "type", Equals, "Product", PropertyEnd,
  "name", Equals, "The name of the product", PropertyEnd,
  "description", Equals, "The description", PropertyEnd,
  "image", Equals, "https://example.com/image.jpg", ValueSeparator, "https://example.com/image2.jpg", PropertyEnd,
]
const reader = TokenReader(ProductTokens)
const result = await Product(reader)
console.dir(result, { depth: null })
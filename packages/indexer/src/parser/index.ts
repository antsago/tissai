import { Title as ParsedValue, Filler } from "./grammar/index.js"
import { type Token as GrammarToken, TokenReader } from "./TokenReader.js"
import mapping from "./mapping.js"
import Lexer, { type Token as LexerToken } from "../lexer/index.js"

const parser = (tokens: GrammarToken[]) => {
  const reader = TokenReader(tokens)

  return ParsedValue(reader)
}

const labeler = (tokens: LexerToken[]) =>
  tokens.map((t) => ({
    ...t,
    labels: t.isMeaningful ? Object.keys(mapping[t.text]) : ["filler"],
  }))

async function parseTitle(title: string) {
  const lexer = Lexer()

  const tokens = await lexer.tokenize(title)
  const labeled = labeler(tokens)
  const attributes = parser(labeled)
  
  await lexer.close()
  
  console.dir(attributes, { depth: null })
}

parseTitle("Pantalones esquí y nieve con CREMALLERA")

// import { MatchToken, Context, and, any, or, withL } from "./operators/index.js"
// import { Rule } from "./operators/Rule.js"

// const PRODUCT_SCHEMA = {
//   "@context": "https://schema.org/",
//   "@type": "Product",
//   name: "The name of the product",
//   productID: "121230",
//   description: "The description",
//   image: "https://example.com/image.jpg",
// }
// const Equals = Symbol('Key-Value assignment')
// const ValueSeparator = Symbol('Value separator')
// const PropertyEnd = Symbol('Property end')
// const ProductTokens = [
//   "type", Equals, "Product", PropertyEnd,
//   "name", Equals, "The name of the product", PropertyEnd,
//   "description", Equals, "The description", PropertyEnd,
//   "image", Equals, "https://example.com/image.jpg", ValueSeparator, "https://example.com/image2.jpg", PropertyEnd,
// ]

// const IsSymbol = (symbol: symbol) => (reader: TokenReader<string|symbol>) => {
//   const nextToken = reader.get()
//   if (nextToken && nextToken === symbol) {
//     reader.next()
//     return nextToken
//   }

//   return null
// }
// const EQ = IsSymbol(Equals)
// const VS = IsSymbol(ValueSeparator)
// const PE = IsSymbol(PropertyEnd)

// const Word = (word?: string) => (reader: TokenReader<string | symbol>) => {
//   const nextToken = reader.get()
//   if (nextToken && typeof nextToken !== 'symbol' && nextToken === word) {
//     reader.next()
//     return nextToken
//   }

//   return null
// }

// const ArrayValue = and(Word(), any(and(VS, Word())), PE)
// const Property = (key: string) => and(Word(key), EQ, ArrayValue)
// const TitleValue = and(ParsedValue, PE)
// const Title = and(Word('name'), EQ, TitleValue)
// const Product = any(or(Title, Property('description'), Property("image")))

// const reader = TokenReader(ProductTokens)

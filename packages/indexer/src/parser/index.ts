import { Attributes } from "./grammar/index.js"
import { TokenReader, type WordToken, type EntityToken } from "./TokenReader.js"
import mapping from "./mapping.js"
import Lexer, { type Token as LexerToken } from "../lexer/index.js"
import { and, any, or, IsSymbol, IsString } from "./operators/index.js"
import { Rule } from "./operators/Rule.js"

type LabelMap = Record<string, Record<string, number>>
const labeler = (map: LabelMap) => (tokens: LexerToken[]) =>
  tokens.map((t) => ({
    ...t,
    labels: t.isMeaningful && t.text in map? Object.keys(map[t.text]) : ["filler"],
  }))

function Compiler<Output>(map: LabelMap, grammar: Rule<WordToken, Output>) {
  const lexer = Lexer()
  const label = labeler(map)

  const compile = async (title: string) => {
    const tokens = await lexer.tokenize(title)
    const labeled = label(tokens)
    return grammar(TokenReader(labeled))
  }

  return {
    compile,
    close: () => lexer.close(),
  }
}
type Compiler<Output> = ReturnType<typeof Compiler<Output>>

const Equals = Symbol('Key-Value assignment')
const ValueSeparator = Symbol('Value separator')
const PropertyEnd = Symbol('Property end')

const parseAs = <Output>(compiler: Compiler<Output>) => async (reader: TokenReader<EntityToken>) => {
  const nextToken = reader.get()
  
  if (!nextToken || typeof nextToken === 'symbol') {
    return null
  }

  const match = await compiler.compile(nextToken)
  if (match === null) {
    return null
  }

  reader.next()
  return match
}

const attributesCompiler = Compiler(mapping, Attributes)
const EQ = IsSymbol(Equals)
const VS = IsSymbol(ValueSeparator)
const PE = IsSymbol(PropertyEnd)
const ArrayValue = and(IsString(), any(and(VS, IsString())), PE)
const Property = (key: string) => and(IsString(key), EQ, ArrayValue)
const TitleValue = parseAs(attributesCompiler)
const Title = and(IsString('name'), EQ, TitleValue, PE)
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
await attributesCompiler.close()
console.dir(result, { depth: null })
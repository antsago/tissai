import type { EntityToken } from "../types.js"
import { Attributes } from "./index.js"
import { and, any, or, Token, parseAs } from "../operators/index.js"
import { Compiler } from "../Compiler.js"
import { Equals, ValueSeparator, PropertyEnd } from "./index.js"

export const productGrammar = (compileGrammar: Compiler["compile"]) => {
  const IsString = (text?: string) =>
    Token(
      (token: EntityToken) =>
        typeof token !== "symbol" && (text === undefined || token === text),
    )
  const IsSymbol = (symbol: symbol) =>
    Token((token: EntityToken) => token === symbol)
  
  const EQ = IsSymbol(Equals)
  const VS = IsSymbol(ValueSeparator)
  const PE = IsSymbol(PropertyEnd)
  
  const ArrayValue = and(IsString(), any(and(VS, IsString())), PE)
  const Property = (key: string) => and(IsString(key), EQ, ArrayValue)
  const TitleValue = parseAs(compileGrammar(Attributes))
  const Title = and(IsString("name"), EQ, TitleValue, PE)
  const Product = any(or(Title, Property("description"), Property("image")))

  return Product
}

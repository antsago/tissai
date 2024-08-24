import type { EntityToken, WordToken } from "../types.js"
import type { Compiler } from "../Compiler.js"
import { withL, and, any, or, Token, parseAs, type Context } from "../operators/index.js"
import { Equals, ValueSeparator, PropertyEnd } from "./index.js"

export const productGrammar = (compileGrammar: Compiler["compile"]) => {
  // Attributes Grammar
  const Filler = Token((word: WordToken) => !word.isMeaningful)
  const Label = (context: Context) =>
    Token(
      (word: WordToken) =>
        word.isMeaningful && context.narrow(word.labels) !== null,
    )
  const Attribute = withL((l) =>
    and(Label(l), any(and(any(Filler), Label(l)))),
  )
  const Attributes = any(or(Attribute, Filler))


  // ProductGrammar
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

import type { EntityToken, WordToken, Rule, RuleResult, RuleReader } from "../types.js"
import type { Compiler } from "../Compiler.js"
import { withL, and, any, or, Token, parseAs, restructure, type Context } from "../operators/index.js"
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

  const ArrayValue = restructure(
    and(IsString(), any(and(VS, IsString())), PE),
    (tokens) => {
      const value = tokens.flat(Infinity).filter(t => typeof t !== "symbol")

      return value?.length === 1 ? value[0] : value 
    },
  )
  const ParsedValue = and(parseAs(compileGrammar(Attributes)), PE)

  type PropertyDefinition = { key: string, parse: boolean }
  type Schema = Record<string, string | PropertyDefinition>

  const Property = ({ key, parse}: PropertyDefinition) => restructure(
    and(IsString(key), EQ, parse ? ParsedValue : ArrayValue),
    ([,, value]) => [key, value]
  )

  const Entity = (rawSchema: Schema) => {
    const schema = Object.fromEntries(Object.entries(rawSchema).map(([k, v]) => [k, typeof v === "string" ? { key: v, parse: false } : v ]))
    const keysMap = Object.fromEntries(Object.entries(schema).map(([k, v]) => [v.key, k]))
    const properties = Object.values(schema).map(Property)

    return restructure(
      any(or(...properties)),
      (entries) => Object.fromEntries(entries),
    )
  }

  const Product = Entity({
    title: {
      key: "name",
      parse: true,
    },
    description: "description",
    images: "image",
  })

  return Product
}

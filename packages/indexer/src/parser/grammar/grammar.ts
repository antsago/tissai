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
    (tokens) => tokens.flat(Infinity).filter(t => typeof t !== "symbol"),
  )

  const Property = (key: string) => restructure(
    and(IsString(key), EQ, ArrayValue),
    ([key, , value]) => ({ key, value: value?.length === 1 ? value[0] : value }),
  )

  type Schema = Record<string, string | { key: string, parse: boolean }>
  const Entity = (rawSchema: Schema) => {
    const schema = Object.fromEntries(Object.entries(rawSchema).map(([k, v]) => [k, typeof v === "string" ? { key: v, parse: false } : v ]))
    const keysMap = Object.fromEntries(Object.entries(schema).map(([k, v]) => [v.key, k]))
    const properties = Object.values(schema).map(({ key, parse }) => parse
      ? restructure(
          and(IsString(key), EQ, parseAs(compileGrammar(Attributes)), PE),
          (attributes) => ({ key, value: attributes })
      )
      : Property(key)
    )

    return restructure(
      any(or(...properties)),
      (keyValues) => Object.fromEntries(keyValues.map(({key, value}) => [keysMap[key as string], value])),
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

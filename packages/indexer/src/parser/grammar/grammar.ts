import type { EntityToken, WordToken, Rule, RuleResult, RuleReader } from "../types.js"
import type { Compiler } from "../Compiler.js"
import { withL, and, any, or, Token, parseAs, type Context } from "../operators/index.js"
import { Equals, ValueSeparator, PropertyEnd } from "./index.js"

const restructure = <R extends Rule<never, unknown>, O>(
  check: R,
  transform: (ruleOutput: NonNullable<Awaited<RuleResult<R>>>) => O,
) =>
  async (reader: RuleReader<R>) => {
    const match = await (check(reader) as RuleResult<R>)

    if (!match) {
      return null
    }

    return transform(match)
  }

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
    ([key, , value]) => ({ key, value }),
  )
  // const TitleValue = parseAs(compileGrammar(Attributes))
  // const Title = and(IsString("name"), EQ, TitleValue, PE)
  const Product = any(or(Property("name"), Property("description"), Property("image")))

  return Product
}

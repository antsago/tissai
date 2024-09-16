import {
  Equals,
  ValueSeparator,
  PropertyEnd,
  PropertyStart,
} from "@tissai/tokenizer"
import type { EntityToken, Rule } from "../../types.js"
import {
  and,
  any,
  restructure,
  type AwaitedMatch,
} from "../../operators/index.js"
import { IsData, IsSymbol } from "./values.js"

const ValueOf = <Output>(Type: Rule<EntityToken, Output>) => {
  return restructure(
    and(Type, any(and(IsSymbol(ValueSeparator), Type))),
    (tokens) =>
      tokens
        .flat(Infinity)
        .filter((t) => typeof t !== "symbol") as AwaitedMatch<Output>[],
  )
}

export const Property = <Output>(
  Type: Rule<EntityToken, Output>,
  name?: string,
) =>
  restructure(
    and(
      IsSymbol(PropertyStart),
      IsData(name),
      IsSymbol(Equals),
      ValueOf(Type),
      IsSymbol(PropertyEnd),
    ),
    ([s, n, eq, value, e]) => value,
  )

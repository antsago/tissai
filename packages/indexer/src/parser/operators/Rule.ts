import type TokenReader from "../TokenReader.js"
import { type Token } from "../TokenReader.js"

export type Rule<T> = (reader: TokenReader<Token>) => T
export type RuleResult<T extends Rule<unknown>> =
  T extends Rule<infer I> ? NonNullable<I> : never

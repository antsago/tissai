import { type TokenReader } from "../TokenReader.js"

export type Rule<Token, Output> = (reader: TokenReader<Token>) => Output
export type RuleResult<R extends Rule<never, unknown>> =
  R extends Rule<never, infer O> ? O : never
export type RuleReader<R extends Rule<never, unknown>> =
  R extends Rule<infer T, unknown> ? TokenReader<T> : never

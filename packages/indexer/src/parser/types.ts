import type { TokenReader } from "./TokenReader.js"
import type { Token } from "../lexer/index.js"

export type LabelMap = Record<string, Record<string, number>>

export type WordToken = Token & { label?: string }
export type EntityToken = string | symbol | number | boolean
export type DataToken = Exclude<EntityToken, symbol>

export type Rule<Token, Output> = (reader: TokenReader<Token>) => Output
export type RuleResult<R extends Rule<never, unknown>> =
  R extends Rule<never, infer O> ? O : never
export type RuleReader<R extends Rule<never, unknown>> =
  R extends Rule<infer T, unknown> ? TokenReader<T> : never

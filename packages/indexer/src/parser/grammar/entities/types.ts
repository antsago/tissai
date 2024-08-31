import type { DataToken } from "../../types.js"

type DistributiveOmit<T, K extends keyof any> = T extends any
  ? Omit<T, K>
  : never

type BaseDefinition = {
  key: string | symbol
  name: string
}
export type DataDefinition = BaseDefinition & {
  value?: DataToken
}
export type ReferenceDefinition = BaseDefinition & {
  isReference: true
}
export type ParsedDefinition = BaseDefinition & {
  parse: { as: string; with: (text: string) => any }
}
export type PropertyDefinition =
  | DataDefinition
  | ParsedDefinition
  | ReferenceDefinition

export const Required = Symbol("Required key")

export type RequiredDefinition = { key: string; value: string }
export type Schema = Record<
  string,
  string | DistributiveOmit<PropertyDefinition, "key">
> & { [Required]: RequiredDefinition }

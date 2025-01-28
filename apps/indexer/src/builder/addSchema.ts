import { Tokenizer } from "@tissai/tokenizer"

type Schema = {
  category: string
  attributes: string[]
}
export type Schemas = Record<string, Record<string, number>>

export function addSchema({ category, attributes }: Schema, schemas: Schemas) {
  const oldAttributes = schemas[category] ?? {}

  return {
    ...schemas,
    [category]: {
      ...oldAttributes,
      ...Object.fromEntries(
        attributes.map((a) => [a, (oldAttributes[a] ?? 0) + 1]),
      ),
    },
  }
}

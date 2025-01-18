import { Tokenizer } from "@tissai/tokenizer"

type Schema = {
  category: string,
  attributes: string[],
}

export function addSchema({ category, attributes }: Schema, schemas: Record<string, Record<string, number>>) {
  const oldAttributes = schemas[category] ?? {}

  return {
    ...schemas,
    [category]: {
      ...oldAttributes,
      ...Object.fromEntries(attributes.map(a => [a, (oldAttributes[a] ?? 0) + 1]))
    }
  }
}

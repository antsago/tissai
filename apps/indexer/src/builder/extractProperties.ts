import { type UUID } from "crypto"

export type Value = {
  name: string[],
  sentences: UUID[]
}

export function extractProperties(values: Value[]) {
  return values.map(value => ({
    name: value.name.join(" "),
    sentences: value.sentences,
  }))
}

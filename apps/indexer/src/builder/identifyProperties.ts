import { type UUID } from "crypto"

export type Value = {
  name: string[],
  sentences: UUID[]
}

export function identifyProperties(values: Value[]) {
  return values.map(value => ({
    name: value.name.join(" "),
    tally: value.sentences.length,
    children: []
  }))
}

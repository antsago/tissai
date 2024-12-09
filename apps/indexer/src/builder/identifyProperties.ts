import { type UUID } from "crypto"

export type Value = {
  name: string[],
  sentences: UUID[]
}

export function identifyProperties(values: Value[]) {
  const value = values[0]
  return [{
    name: value.name.join(" "),
    tally: value.sentences.length,
    children: []
  }]
}

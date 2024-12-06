import { randomUUID, type UUID } from "crypto"

type Value = {
  name: string[],
  sentences: UUID[]
}

export function extractValues(title: string, values: Value[]) {
  const words = title.split(" ")

  return [{
    name: words,
    sentences: [randomUUID()],
  }]
}

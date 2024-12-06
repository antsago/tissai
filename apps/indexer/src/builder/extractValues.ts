import { randomUUID, type UUID } from "crypto"

export type Value = {
  name: string[],
  sentences: UUID[]
}

export function extractValues(title: string, values: Value[]) {
  const words = title.split(" ")

  return [
    ...values,
    {
      name: words,
      sentences: [randomUUID()],
    },
  ]
}

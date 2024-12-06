import { randomUUID } from "crypto"

export function extractValues(titles: string[]) {
  return titles.map(title => ({
      name: title.split(" "),
      sentences: [randomUUID()],
    }))
}

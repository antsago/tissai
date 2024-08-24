import type { EntityToken } from "../types.js"
import type { TokenReader } from "../TokenReader.js"

export const parseAs =
  <Output>(parse: (text: string) => Output) =>
  async (reader: TokenReader<EntityToken>) => {
    const nextToken = reader.get()

    if (!nextToken || typeof nextToken === "symbol") {
      return null
    }

    const match = await parse(nextToken)
    if (match === null) {
      return null
    }

    reader.next()
    return match
  }

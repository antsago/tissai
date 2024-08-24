import type { EntityToken } from "../types.js"
import type { TokenReader } from "../TokenReader.js"
import { Compiler } from "../Compiler.js"

export const parseAs = <Output>(compiler: Compiler<Output>) => async (reader: TokenReader<EntityToken>) => {
  const nextToken = reader.get()
  
  if (!nextToken || typeof nextToken === 'symbol') {
    return null
  }

  const match = await compiler.compile(nextToken)
  if (match === null) {
    return null
  }

  reader.next()
  return match
}

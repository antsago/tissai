import type { Rule } from "../types.js"
import type { TokenReader } from "../TokenReader.js"

export const given = <T, CO, MO>(condition: Rule<T, CO>, onMatch: Rule<T, MO>) =>
  async (reader: TokenReader<T>) => {
    reader.savePosition()

    while(reader.hasNext()) {
      const match = await condition(reader)

      if (match !== null) {
        reader.restoreSave()
        return onMatch(reader)
      }
      
      reader.next()
    }
    
    reader.restoreSave()
    return null
  }

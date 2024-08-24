export function TokenReader<T>(tokens: T[]) {
  let position = 0
  let positionStack = [] as number[]

  return {
    savePosition() {
      positionStack.push(position)
    },
    restoreSave() {
      position = this.discardSave() ?? position
    },
    discardSave() {
      return positionStack.pop()
    },
    get(): T | undefined {
      return tokens[position]
    },
    next() {
      position++
    },
    hasNext() {
      return position < tokens.length
    },
  }
}

export type TokenReader<T> = ReturnType<typeof TokenReader<T>>

export type Token = { labels: string[]; isMeaningful: boolean; text: string }

class TokenReader<T> {
  private position = 0
  private positionStack = [] as number[]

  constructor(readonly tokens: T[]) {}

  savePosition() {
    this.positionStack.push(this.position)
  }

  restoreSave() {
    this.position = this.discardSave() ?? this.position
  }

  discardSave() {
    return this.positionStack.pop()
  }

  get(): T | undefined {
    return this.tokens[this.position]
  }

  getLastToken() {
    return this.tokens[this.tokens.length - 1]
  }

  next() {
    this.position++
  }

  hasNext() {
    return this.position < this.tokens.length
  }
}

export default TokenReader

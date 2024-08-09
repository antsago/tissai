export type Token = { labels: string[], isMeaningful: boolean, text: string }

class TokenReader<T> {
  private position = 0
  private stateStack = [] as number[]

  constructor(readonly tokens: T[]) {}

  savePosition() {
    this.stateStack.push(this.position)
  }

  restoreSave() {
    this.position = this.discardSave() ?? this.position
  }

  discardSave() {
    return this.stateStack.pop()
  }

  get() {
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

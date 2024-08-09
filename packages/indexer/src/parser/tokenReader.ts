export type Token = { type: string; value: string }

class TokenReader {
  private position = 0
  private stateStack = [] as number[]

  constructor(readonly tokens: Token[]) {}

  pushState() {
    this.stateStack.push(this.position)
  }

  restoreState() {
    this.position = this.popState()
  }

  popState() {
    return this.stateStack.pop()!
  }

  isType(type: string) {
    return this.hasNext() && this.getType() === type
  }

  getType() {
    return this.get().type
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

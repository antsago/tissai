export type Token = { label: string; text: string }

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

  isLabel(label: string) {
    return this.hasNext() && this.geLabel() === label
  }

  geLabel() {
    return this.get().label
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

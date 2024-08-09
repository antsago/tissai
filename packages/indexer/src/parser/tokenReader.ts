export type Token = { label: string[]; text: string }

class TokenReader {
  private position = 0
  private stateStack = [] as number[]

  constructor(readonly tokens: Token[]) {}

  savePosition() {
    this.stateStack.push(this.position)
  }

  restoreSave() {
    this.position = this.discardSave() ?? this.position
  }

  discardSave() {
    return this.stateStack.pop()!
  }

  hasLabel(desiredLabels: string[]) {
    return this.getLabels().some(tokenLabel => desiredLabels.includes(tokenLabel))
  }

  getLabels() {
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
    return this.position < this.tokens.length - 1
  }
}

export default TokenReader

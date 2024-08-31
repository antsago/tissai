import _ from "lodash"

class Context {
  public label?: string

  narrow(newLabel: string) {
    if (this.label === undefined) {
      return (this.label = newLabel)
    }

    if (this.label === newLabel) {
      return this.label
    }
    
    return null
  }
}

export default Context

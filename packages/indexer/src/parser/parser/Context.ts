import _ from "lodash"

class Context {
  public labels?: string[]

  narrow(newLabels: string[]) {
    if (this.labels === undefined) {
      return this.labels = newLabels
    }

    const intersect = _.intersection(newLabels, this.labels)

    if (!intersect.length) {
      return null
    }

    return this.labels = intersect
  }
}

export default Context

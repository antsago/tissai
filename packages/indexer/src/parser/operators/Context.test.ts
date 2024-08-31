import { expect, describe, it } from "vitest"
import Context from "./Context.js"

describe("Context", () => {
  it("holds passed label", () => {
    const label = "a"
    const context = new Context()

    const result = context.narrow(label)

    expect(result).toStrictEqual(label)
    expect(context.label).toStrictEqual(label)
  })

  it("starts with no label", () => {
    const context = new Context()
    expect(context.label).toBe(undefined)
  })

  it("accepts equal labels", () => {
    const label = "a"
    const context = new Context()
    context.narrow(label)

    const result = context.narrow("a")

    expect(result).toStrictEqual(label)
    expect(context.label).toStrictEqual(label)
  })

  it("rejects different labels", () => {
    const label = "a"
    const context = new Context()
    context.narrow(label)

    const result = context.narrow("b")

    expect(result).toBe(null)
    expect(context.label).toStrictEqual(label)
  })
})

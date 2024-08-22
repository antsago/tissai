import { expect, describe, it } from "vitest"
import Context from "./Context.js"

describe("Context", () => {
  it("holds passed labels", () => {
    const labels = ["a", "b"]
    const context = new Context()

    const result = context.narrow(labels)

    expect(result).not.toBe(null)
    expect(context.labels).toStrictEqual(labels)
  })

  it("starts with no labels", () => {
    const context = new Context()
    expect(context.labels).toBe(undefined)
  })

  it("narrows labels", () => {
    const context = new Context()
    context.narrow(["a", "b"])

    const result = context.narrow(["b", "c"])

    expect(result).not.toBe(null)
    expect(context.labels).toStrictEqual(["b"])
  })

  it("rejects empty narrowing", () => {
    const labels = ["a", "b"]
    const context = new Context()
    context.narrow(labels)

    const result = context.narrow(["c", "d"])

    expect(result).toBe(null)
    expect(context.labels).toStrictEqual(labels)
  })
})

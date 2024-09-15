import { expect, describe, it } from "vitest"
import { TokenReader } from "../../TokenReader.js"
import { Context, NonMatch } from "../../operators/index.js"
import { Labeled } from "./index.js"

describe("Labeled", () => {
  const TOKEN_BASE = {
    originalText: "foo",
    trailing: "",
    text: "a",
  }

  it("rejects meaningless tokens", () => {
    const token = {
      ...TOKEN_BASE,
      label: "label",
      isMeaningful: false,
    }
    const context = new Context()

    const result = Labeled(context)(TokenReader([token]))

    expect(result).toBe(NonMatch)
  })

  it("rejects unlabelled tokens", () => {
    const token = {
      ...TOKEN_BASE,
      label: undefined,
      isMeaningful: true,
    }
    const context = new Context()

    const result = Labeled(context)(TokenReader([token]))

    expect(result).toBe(NonMatch)
  })

  it("rejects unexpected labels", () => {
    const token = {
      ...TOKEN_BASE,
      label: "label",
      isMeaningful: true,
    }
    const context = new Context()
    context.narrow("another label")

    const result = Labeled(context)(TokenReader([token]))

    expect(result).toBe(NonMatch)
  })

  it("matches expected labels", () => {
    const token = {
      ...TOKEN_BASE,
      label: "label",
      isMeaningful: true,
    }
    const context = new Context()
    context.narrow("label")

    const result = Labeled(context)(TokenReader([token]))

    expect(result).toBe(token)
  })

  it("matches labels without expectations", () => {
    const token = {
      ...TOKEN_BASE,
      label: "label",
      isMeaningful: true,
    }
    const context = new Context()

    const result = Labeled(context)(TokenReader([token]))

    expect(result).toBe(token)
    expect(context.label).toBe(token.label)
  })
})

import { expect, describe, it } from "vitest"
import { TokenReader } from "../../TokenReader.js"
import { NonMatch } from "../../operators/index.js"
import { Filler } from "./index.js"

describe("Filler", () => {
  const TOKEN_BASE = {
    originalText: "foo",
    trailing: "",
    text: "a",
  }

  it("rejects meaningless tokens", () => {
    const token = {
      ...TOKEN_BASE,
      label: "label",
      isMeaningful: true,
    }

    const result = Filler(TokenReader([token]))

    expect(result).toBe(NonMatch)
  })

  it("matches non-meaningful tokens", () => {
    const token = {
      ...TOKEN_BASE,
      label: "label",
      isMeaningful: false,
    }

    const result = Filler(TokenReader([token]))

    expect(result).toBe(token)
  })

  it("matches label-less tokens", () => {
    const token = {
      ...TOKEN_BASE,
      label: undefined,
      isMeaningful: true,
    }

    const result = Filler(TokenReader([token]))

    expect(result).toBe(token)
  })
})

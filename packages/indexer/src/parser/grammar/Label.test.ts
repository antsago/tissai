import { expect, describe, it } from "vitest"
import { TokenReader } from "../TokenReader.js"
import { Context, NonMatch } from "../operators/index.js"
import { Label } from "./attributes.js"

describe("Label", () => {
  const TOKEN_BASE = {
    originalText: "foo",
    trailing: "",
  }

  it("returns no match if no next token", () => {
    const reader = TokenReader([])
    const context = new Context()

    const result = Label(context)(reader)

    expect(result).toBe(NonMatch)
  })

  it("returns no match if the next token is not meaningful", () => {
    const TOKENS = [
      { label: "filler", isMeaningful: false, text: "a", ...TOKEN_BASE },
      { label: "label", isMeaningful: true, text: "token", ...TOKEN_BASE },
    ]
    const reader = TokenReader(TOKENS)
    const context = new Context()

    const result = Label(context)(reader)

    expect(result).toBe(NonMatch)
    expect(reader.get()).toStrictEqual(TOKENS[0])
  })

  it("returns no match if not meeting desired label", () => {
    const TOKENS = [
      {
        label: "label1",
        isMeaningful: true,
        text: "a",
        ...TOKEN_BASE,
      },
      { label: "label", isMeaningful: true, text: "token", ...TOKEN_BASE },
    ]
    const reader = TokenReader(TOKENS)
    const context = new Context()
    context.narrow(TOKENS[1].label)

    const result = Label(context)(reader)

    expect(result).toBe(NonMatch)
    expect(reader.get()).toStrictEqual(TOKENS[0])
  })

  it("returns token if it's meaningful", () => {
    const TOKENS = [
      {
        label: "label1",
        isMeaningful: true,
        text: "a",
        ...TOKEN_BASE,
      },
      { label: "label", isMeaningful: true, text: "token", ...TOKEN_BASE },
    ]
    const reader = TokenReader(TOKENS)
    const context = new Context()

    const result = Label(context)(reader)

    expect(result).toStrictEqual(TOKENS[0])
    expect(reader.get()).toStrictEqual(TOKENS[1])
  })

  it("returns token if it includes one desired label", () => {
    const TOKENS = [
      {
        label: "label1",
        isMeaningful: true,
        text: "a",
        ...TOKEN_BASE,
      },
      { label: "label", isMeaningful: true, text: "token", ...TOKEN_BASE },
    ]
    const reader = TokenReader(TOKENS)
    const context = new Context()
    context.narrow(TOKENS[0].label)

    const result = Label(context)(reader)

    expect(result).toStrictEqual(TOKENS[0])
    expect(reader.get()).toStrictEqual(TOKENS[1])
    expect(context.label).toStrictEqual(TOKENS[0].label)
  })
})

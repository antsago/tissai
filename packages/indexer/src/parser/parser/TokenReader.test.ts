import { expect, describe, it } from "vitest"
import TokenReader from "./TokenReader.js"

describe("TokenReader", () => {
  const TOKENS = [
    { labels: ["label1", "label2"], isMeaningful: true, text: "a" },
    { labels: ["label"], isMeaningful: true, text: "token" },
  ]

  it("retrieves tokens", () => {
    const reader = new TokenReader(TOKENS)

    expect(reader.get()).toStrictEqual(TOKENS[0])
    expect(reader.getLastToken()).toStrictEqual(TOKENS[1])
  })

  it("changes position", () => {
    const reader = new TokenReader(TOKENS)
    expect(reader.hasNext()).toBe(true)
    
    reader.next()
    reader.next()
    
    expect(reader.hasNext()).toBe(false)
    expect(reader.get()).toStrictEqual(undefined)
  })

  it("resets position when restoring save", () => {
    const reader = new TokenReader(TOKENS)
    
    reader.savePosition()
    reader.next()
    reader.restoreSave()
    
    expect(reader.get()).toBe(TOKENS[0])
  })

  it("preserves position when discarding save", () => {
    const reader = new TokenReader(TOKENS)
    
    reader.savePosition()
    reader.next()
    reader.discardSave()
    
    expect(reader.get()).toBe(TOKENS[1])
  })

  it("preserves position if no save to restore", () => {
    const reader = new TokenReader(TOKENS)
    
    reader.next()
    reader.restoreSave()
    
    expect(reader.get()).toBe(TOKENS[1])
  })
})

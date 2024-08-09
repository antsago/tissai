import { expect, describe, it } from "vitest"
import TokenReader from "./tokenReader.js"

describe("TokenReader", () => {
  const TOKENS = [{ label: ["label1", "label2"], text: "a" }, { label: ["label"], text: "token" }]

  it("offers getters", () => {

    const reader = new TokenReader(TOKENS)

    expect(reader.get()).toStrictEqual(TOKENS[0])
    expect(reader.getLastToken()).toStrictEqual(TOKENS[1])
    expect(reader.getLabels()).toStrictEqual(TOKENS[0].label)
  })

  it("changes position", () => {
    const reader = new TokenReader(TOKENS)
    expect(reader.hasNext()).toBe(true)
    
    reader.next()
    
    expect(reader.hasNext()).toBe(false)
    expect(reader.get()).toStrictEqual(TOKENS[1])
  })

  describe("isLabel", () => {
    it("returns true if current token has one desired label", () => {
      const reader = new TokenReader(TOKENS)
      
      const result = reader.hasLabel(["foo", TOKENS[0].label[0]])
      
      expect(result).toBe(true)
    })

    it("returns false if no label overlaps", () => {
      const reader = new TokenReader(TOKENS)
      
      const result = reader.hasLabel(TOKENS[1].label)
      
      expect(result).toBe(false)
    })

    it("returns false if no label overlaps", () => {
      const reader = new TokenReader(TOKENS)
      
      const result = reader.hasLabel(TOKENS[1].label)
      
      expect(result).toBe(false)
    })
  })

  it("resets position when restoring save", () => {
    const reader = new TokenReader(TOKENS)
    
    reader.savePosition()
    reader.next()
    reader.restoreSave()
    
    expect(reader.get()).toBe(TOKENS[0])
  })

  it("preserved position when discarding save", () => {
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

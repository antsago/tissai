import { expect, describe, it } from "vitest"
import TokenReader from "./TokenReader.js"
import Attribute from "./Attribute.js"

describe("Attribute", () => {
  it("returns null if no next token", () => {
    const reader = new TokenReader([])

    const result = Attribute(reader)

    expect(result).toBe(null)
  })

  it("rejects starting fillers", () => {
    const tokens = [
      { labels: ["filler"], isMeaningful: false, text: "a" },
      { labels: ["label"], isMeaningful: true, text: "token" },
    ]
    const reader = new TokenReader(tokens)

    const result = Attribute(reader)

    expect(result).toBe(null)
    expect(reader.get()).toStrictEqual(tokens[0])
  })

  it("recognizes single labels", () => {
    const tokens = [
      { labels: ["label"], isMeaningful: true, text: "token" },
      { labels: ["filler"], isMeaningful: false, text: "a" },
    ]
    const reader = new TokenReader(tokens)

    const result = Attribute(reader)

    expect(result).toStrictEqual({
      type: "attribute",
      labels: tokens[0].labels,
      value: tokens.slice(0, 1),
    })
    expect(reader.get()).toStrictEqual(tokens[1])
  })

  it("recognizes consecutive labels", () => {
    const tokens = [
      { labels: ["label"], isMeaningful: true, text: "token" },
      { labels: ["label"], isMeaningful: true, text: "token" },
      { labels: ["filler"], isMeaningful: false, text: "a" },
    ]
    const reader = new TokenReader(tokens)

    const result = Attribute(reader)

    expect(result).toStrictEqual({
      type: "attribute",
      labels: tokens[0].labels,
      value: tokens.slice(0, 2),
    })
    expect(reader.get()).toStrictEqual(tokens[2])
  })

  it("recognizes minimum common labels", () => {
    const tokens = [
      { labels: ["label1", "label2"], isMeaningful: true, text: "token" },
      { labels: ["label1"], isMeaningful: true, text: "token" },
    ]
    const reader = new TokenReader(tokens)

    const result = Attribute(reader)

    expect(result).toStrictEqual({
      type: "attribute",
      labels: ["label1"],
      value: tokens,
    })
  })

  it("build minimum common labels iteratively", () => {
    const tokens = [
      { labels: ["label1", "label2"], isMeaningful: true, text: "token" },
      { labels: ["label1"], isMeaningful: true, text: "token" },
      { labels: ["label2"], isMeaningful: true, text: "token" },
    ]
    const reader = new TokenReader(tokens)

    const result = Attribute(reader)

    expect(result).toStrictEqual({
      type: "attribute",
      labels: ["label1"],
      value: tokens.slice(0, 2),
    })
  })

  it("accepts inbetween filler", () => {
    const tokens = [
      { labels: ["label"], isMeaningful: true, text: "token" },
      { labels: ["filler"], isMeaningful: false, text: "a" },
      { labels: ["label"], isMeaningful: true, text: "token" },
      { labels: ["filler"], isMeaningful: false, text: "a" },
    ]
    const reader = new TokenReader(tokens)

    const result = Attribute(reader)

    expect(result).toStrictEqual({
      type: "attribute",
      labels: tokens[0].labels,
      value: tokens.slice(0, 3),
    })
    expect(reader.get()).toStrictEqual(tokens[3])
  })

  it("accepts multiple infiller", () => {
    const tokens = [
      { labels: ["label"], isMeaningful: true, text: "token" },
      { labels: ["filler"], isMeaningful: false, text: "a" },
      { labels: ["filler"], isMeaningful: false, text: "a" },
      { labels: ["label"], isMeaningful: true, text: "token" },
      { labels: ["filler"], isMeaningful: false, text: "a" },
    ]
    const reader = new TokenReader(tokens)

    const result = Attribute(reader)

    expect(result).toStrictEqual({
      type: "attribute",
      labels: tokens[0].labels,
      value: tokens.slice(0, 4),
    })
    expect(reader.get()).toStrictEqual(tokens[4])
  })

  it("does not append different labels", () => {
    const tokens = [
      { labels: ["label"], isMeaningful: true, text: "token" },
      { labels: ["filler"], isMeaningful: false, text: "a" },
      { labels: ["other label"], isMeaningful: true, text: "token" },
      { labels: ["filler"], isMeaningful: false, text: "a" },
    ]
    const reader = new TokenReader(tokens)

    const result = Attribute(reader)

    expect(result).toStrictEqual({
      type: "attribute",
      labels: tokens[0].labels,
      value: tokens.slice(0, 1),
    })
    expect(reader.get()).toStrictEqual(tokens[1])
  })
})

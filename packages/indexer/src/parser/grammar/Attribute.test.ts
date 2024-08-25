import { expect, describe, it } from "vitest"
import type { WordToken } from "../types.js"
import { TokenReader } from "../TokenReader.js"
import { Attribute } from "./attributes.js"

describe("Attribute", () => {
  const getText = (tokens: WordToken[]) => tokens.map((t) => t.text).join(" ")

  it("returns null if no next token", async () => {
    const reader = TokenReader([])

    const result = await Attribute(reader)

    expect(result).toBe(null)
  })

  it("rejects starting fillers", async () => {
    const tokens = [
      { labels: ["filler"], isMeaningful: false, text: "a" },
      { labels: ["label"], isMeaningful: true, text: "token" },
    ]
    const reader = TokenReader(tokens)

    const result = await Attribute(reader)

    expect(result).toBe(null)
    expect(reader.get()).toStrictEqual(tokens[0])
  })

  it("recognizes single labels", async () => {
    const tokens = [
      { labels: ["label"], isMeaningful: true, text: "token" },
      { labels: ["filler"], isMeaningful: false, text: "a" },
    ]
    const reader = TokenReader(tokens)

    const result = await Attribute(reader)

    expect(result).toStrictEqual({
      labels: tokens[0].labels,
      value: getText(tokens.slice(0, 1)),
    })
    expect(reader.get()).toStrictEqual(tokens[1])
  })

  it("recognizes consecutive labels", async () => {
    const tokens = [
      { labels: ["label"], isMeaningful: true, text: "token" },
      { labels: ["label"], isMeaningful: true, text: "token" },
      { labels: ["filler"], isMeaningful: false, text: "a" },
    ]
    const reader = TokenReader(tokens)

    const result = await Attribute(reader)

    expect(result).toStrictEqual({
      labels: tokens[0].labels,
      value: getText(tokens.slice(0, 2)),
    })
    expect(reader.get()).toStrictEqual(tokens[2])
  })

  it("recognizes minimum common labels", async () => {
    const tokens = [
      { labels: ["label1", "label2"], isMeaningful: true, text: "token" },
      { labels: ["label1"], isMeaningful: true, text: "token" },
    ]
    const reader = TokenReader(tokens)

    const result = await Attribute(reader)

    expect(result).toStrictEqual({
      labels: ["label1"],
      value: getText(tokens),
    })
  })

  it("build minimum common labels iteratively", async () => {
    const tokens = [
      { labels: ["label1", "label2"], isMeaningful: true, text: "token" },
      { labels: ["label1"], isMeaningful: true, text: "token" },
      { labels: ["label2"], isMeaningful: true, text: "token" },
    ]
    const reader = TokenReader(tokens)

    const result = await Attribute(reader)

    expect(result).toStrictEqual({
      labels: ["label1"],
      value: getText(tokens.slice(0, 2)),
    })
  })

  it("accepts inbetween filler", async () => {
    const tokens = [
      { labels: ["label"], isMeaningful: true, text: "token" },
      { labels: ["filler"], isMeaningful: false, text: "a" },
      { labels: ["label"], isMeaningful: true, text: "token" },
      { labels: ["filler"], isMeaningful: false, text: "a" },
    ]
    const reader = TokenReader(tokens)

    const result = await Attribute(reader)

    expect(result).toStrictEqual({
      labels: tokens[0].labels,
      value: getText(tokens.slice(0, 3)),
    })
    expect(reader.get()).toStrictEqual(tokens[3])
  })

  it("accepts multiple infiller", async () => {
    const tokens = [
      { labels: ["label"], isMeaningful: true, text: "token" },
      { labels: ["filler"], isMeaningful: false, text: "a" },
      { labels: ["filler"], isMeaningful: false, text: "a" },
      { labels: ["label"], isMeaningful: true, text: "token" },
      { labels: ["filler"], isMeaningful: false, text: "a" },
    ]
    const reader = TokenReader(tokens)

    const result = await Attribute(reader)

    expect(result).toStrictEqual({
      labels: tokens[0].labels,
      value: getText(tokens.slice(0, 4)),
    })
    expect(reader.get()).toStrictEqual(tokens[4])
  })

  it("does not append different labels", async () => {
    const tokens = [
      { labels: ["label"], isMeaningful: true, text: "token" },
      { labels: ["filler"], isMeaningful: false, text: "a" },
      { labels: ["other label"], isMeaningful: true, text: "token" },
      { labels: ["filler"], isMeaningful: false, text: "a" },
    ]
    const reader = TokenReader(tokens)

    const result = await Attribute(reader)

    expect(result).toStrictEqual({
      labels: tokens[0].labels,
      value: tokens[0].text,
    })
    expect(reader.get()).toStrictEqual(tokens[1])
  })
})

import { expect, describe, it } from "vitest"
import matchLabels from "./matchLabels.js"

describe("matchLabels", () => {
  it("matches full tokens", () => {
    const tokens = ["token"]
    const attributes = [{ label: "label", value: "token" }]

    const result = matchLabels(tokens, attributes)

    expect(result).toStrictEqual([{ token: "token", label: "label" }])
  })

  it("matches combined tokens", () => {
    const tokens = ["start", "middle", "end"]
    const attributes = [{ label: "label", value: "start, middle, and end" }]

    const result = matchLabels(tokens, attributes)

    expect(result).toStrictEqual([
      { token: "start", label: "label" },
      { token: "middle", label: "label" },
      { token: "end", label: "label" },
    ])
  })

  it("throws unmatched tokens", () => {
    const tokens = ["middle", "start", "end"]
    const attributes = [{ label: "label", value: "start, middle, and end" }]

    const act = () => matchLabels(tokens, attributes)

    expect(act).toThrow()
  })

  it("throws unmatched combined tokens ", () => {
    const tokens = ["start", "foo", "end"]
    const attributes = [{ label: "label", value: "start, middle, and end" }]

    const act = () => matchLabels(tokens, attributes)

    expect(act).toThrow()
  })
})

import { expect, describe, it } from "vitest"
import { getLabels } from "./getLabels.js"

describe("getLabels", () => {
  it("returns most frequent label", () => {
    const map = { word: { unfrequent: 1, frequent: 10 }}
    const result = getLabels(map)([{
      text: "word",
      originalText: "word",
      isMeaningful: true,
      trailing: ""
    }])

    expect(result).toStrictEqual(["frequent"])
  })
})

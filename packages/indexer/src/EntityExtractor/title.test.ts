import { expect, describe, it } from "vitest"
import title from "./title.js"

const JSON_LD = {
  title: "The title from jsonLd",
}
const OG = {
  title: "The title from opengraph",
}
const HEAD = {
  title: "The title from headings",
}

describe("title", () => {
  it("prefers jsonLd", async () => {
    const result = await title(JSON_LD, OG, HEAD)

    expect(result).toStrictEqual(JSON_LD.title)
  })

  it("defaults to opengraph", async () => {
    const result = await title({}, OG, HEAD)

    expect(result).toStrictEqual(OG.title)
  })

  it("defaults to headings", async () => {
    const result = await title({}, {}, HEAD)

    expect(result).toStrictEqual(HEAD.title)
  })
})

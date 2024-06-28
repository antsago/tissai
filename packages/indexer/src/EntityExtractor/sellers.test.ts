import { expect, describe, it } from "vitest"
import sellers from "./sellers"

describe("sellers", () => {
  it("handles empty offers", async () => {
    const result = sellers({ offers: [] })

    expect(result).toStrictEqual([])
  })

  it("extracts seller", async () => {
    const result = sellers({ offers: [{ seller: "pertemba" }] })

    expect(result).toStrictEqual([{ name: "pertemba" }])
  })

  it("turns name to lowercase", async () => {
    const result = sellers({ offers: [{ seller: "PERTEMBA" }] })

    expect(result).toStrictEqual([{ name: "pertemba" }])
  })

  it("extracts multiple sellers", async () => {
    const result = sellers({
      offers: [{ seller: "pertemba" }, { seller: "batemper" }],
    })

    expect(result).toStrictEqual([{ name: "pertemba" }, { name: "batemper" }])
  })

  it("handles offers without sellers", async () => {
    const result = sellers({ offers: [{}] })

    expect(result).toStrictEqual([])
  })
})

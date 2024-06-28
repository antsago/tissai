import { expect, describe, it } from "vitest"
import brand from "./brand.js"

const NAME = "wedze"
const LOGO = "https://brand.com/image.jpg"

describe("brands", () => {
  it("extracts brand", async () => {
    const result = brand({ brandName: NAME, brandLogo: LOGO })

    expect(result).toStrictEqual({
      name: NAME,
      logo: LOGO,
    })
  })

  it("handles brands without logo", async () => {
    const result = brand({ brandName: NAME })

    expect(result).toStrictEqual({
      name: NAME,
      logo: undefined,
    })
  })

  it("turns name to lowercase", async () => {
    const result = brand({ brandName: "WEDZE" })

    expect(result).toStrictEqual({
      name: "wedze",
      logo: undefined,
    })
  })

  it("handles pages without brand", async ({}) => {
    const result = brand({})

    expect(result).toBe(undefined)
  })
})

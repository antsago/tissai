import { expect, describe, it } from "vitest"
import { type Value, identifyProperties } from "./identifyProperties"

describe("identifyProperties", () => {
  it("groups values into properties", () => {
    const values = [
      {
        name: ["jeans", "camel"],
        sentences: ["fa687f28-c728-4f52-a89f-69076c4143bf", "24145af3-bbee-425a-875c-ed010c53e64a"],
      },
    ] as Value[]

    const result = identifyProperties(values)

    expect(result).toStrictEqual([
      {
        name: "jeans camel",
        tally: 2,
        children: [],
      },
    ])
  })
})

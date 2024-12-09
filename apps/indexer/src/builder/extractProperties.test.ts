import { expect, describe, it } from "vitest"
import { type Value, extractProperties } from "./extractProperties"

describe("extractProperties", () => {
  it("converts values into properties", () => {
    const values = [
      {
        name: ["jeans", "camel"],
        sentences: ["fa687f28-c728-4f52-a89f-69076c4143bf"],
      },
    ] as Value[]

    const result = extractProperties(values)

    expect(result).toStrictEqual([
      [
        {
          name: "jeans camel",
          sentences: ["fa687f28-c728-4f52-a89f-69076c4143bf"],
        },
      ],
    ])
  })

  it("groups non-coocurring values", () => {
    const values = [
      {
        name: ["jeans"],
        sentences: ["fa687f28-c728-4f52-a89f-69076c4143bf"],
      },
      {
        name: ["vaqueros"],
        sentences: ["24145af3-bbee-425a-875c-ed010c53e64a"],
      },
    ] as Value[]

    const result = extractProperties(values)

    expect(result).toStrictEqual([
      [
        {
          name: "jeans",
          sentences: ["fa687f28-c728-4f52-a89f-69076c4143bf"],
        },
        {
          name: "vaqueros",
          sentences: ["24145af3-bbee-425a-875c-ed010c53e64a"],
        },
      ],
    ])
  })

  it("puts coocurring in different properties", () => {
    const values = [
      {
        name: ["jeans"],
        sentences: [
          "fa687f28-c728-4f52-a89f-69076c4143bf",
          "24145af3-bbee-425a-875c-ed010c53e64a",
        ],
      },
      {
        name: ["azul"],
        sentences: ["24145af3-bbee-425a-875c-ed010c53e64a"],
      },
    ] as Value[]

    const result = extractProperties(values)

    expect(result).toStrictEqual([
      [
        {
          name: "jeans",
          sentences: [
            "fa687f28-c728-4f52-a89f-69076c4143bf",
            "24145af3-bbee-425a-875c-ed010c53e64a",
          ],
        },
      ],
      [
        {
          name: "azul",
          sentences: ["24145af3-bbee-425a-875c-ed010c53e64a"],
        },
      ],
    ])
  })

  it("starts with most frequent property", () => {
    const values = [
      {
        name: ["first"],
        sentences: ["24145af3-bbee-425a-875c-ed010c53e64a"],
      },
      {
        name: ["second"],
        sentences: [
          "fa687f28-c728-4f52-a89f-69076c4143bf",
          "24145af3-bbee-425a-875c-ed010c53e64a",
        ],
      },
      {
        name: ["third"],
        sentences: ["3b22d905-d4d1-4c6f-8cbb-f660edeef4ac"],
      },
    ] as Value[]

    const result = extractProperties(values)

    expect(result).toStrictEqual([
      [
        {
          name: "second",
          sentences: [
            "fa687f28-c728-4f52-a89f-69076c4143bf",
            "24145af3-bbee-425a-875c-ed010c53e64a",
          ],
        },
        {
          name: "third",
          sentences: ["3b22d905-d4d1-4c6f-8cbb-f660edeef4ac"],
        },
      ],
      [
        {
          name: "first",
          sentences: ["24145af3-bbee-425a-875c-ed010c53e64a"],
        },
      ],
    ])
  })
})

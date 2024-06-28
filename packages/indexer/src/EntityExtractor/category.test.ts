import { expect, describe, test } from "vitest"
import { mockPythonFixture } from "@tissai/python-pool/mocks"
import { PythonPool } from "@tissai/python-pool"
import { DERIVED_DATA } from "#mocks"
import category from "./category"

type Fixtures = {
  mockPython: mockPythonFixture
}

const it = test.extend<Fixtures>({
  mockPython: [mockPythonFixture, { auto: true }],
})

describe("categories", () => {
  it("extracts category", async ({ mockPython }) => {
    const pool = PythonPool("script", { log: () => {} })
    mockPython.mockReturnValue(DERIVED_DATA)

    const result = await category("The title of the product", pool as any)

    expect(result).toStrictEqual({
      name: DERIVED_DATA.category,
    })
  })
})

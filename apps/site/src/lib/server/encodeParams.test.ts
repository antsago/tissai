import { describe, it, expect, beforeEach } from "vitest"
import { PRODUCT } from "@tissai/db/mocks"
import { encodeParams } from "./encodeParams"

describe("encodeParams", () => {
  let params: URLSearchParams
  beforeEach(() => {
    params = new URLSearchParams()
  })

  it("encodes url parameters", async () => {
    const params = {
      query: "busco un pantalón",
      brand: "a brand",
      min: 11.1,
      max: 22.2,
      category: "80be7c8e-26dd-47e8-8325-f4bac459dae1",
      attributes: ["bc82024f-4532-4f98-ba66-6701f83f76ac"],
    }

    const result = encodeParams(params)

    expect(result).toStrictEqual(`q=busco+un+pantal%C3%B3n&brand=a+brand&max=${params.max}&min=${params.min}&cat=${params.category}&att=${params.attributes[0]}`)
  })

  it("supports multiple attributes", async () => {
    const params = {
      query: "",
      attributes: [
        "bc82024f-4532-4f98-ba66-6701f83f76ac",
        "b24cfb54-c160-4190-9715-deeb0c7798ac",
      ],
    }

    const result = encodeParams(params)

    expect(result).toStrictEqual(`q=&att=${params.attributes[0]}&att=${params.attributes[1]}`)
  })

  it("handles empty search", async () => {
    const params = { query: "" }

    const result = encodeParams(params)

    expect(result).toStrictEqual("q=")
  })
})

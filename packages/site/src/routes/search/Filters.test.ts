import "@testing-library/jest-dom/vitest"
import { describe, it, expect, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/svelte"
import { CATEGORY, TAG } from "@tissai/db/mocks"
import { CAT_ATTRIBUTE, BOOL_ATTRIBUTE, BRAND, STRING_ATTRIBUTE } from "mocks"
import Filters from "./Filters.svelte"

describe("Filters", () => {
  afterEach(() => {
    cleanup()
  })

  it("displays brands filter", async () => {
    render(Filters, { filters: { brand: BRAND.name } })

    const brandName = screen.getByText(BRAND.name, { exact: false })

    expect(brandName).toBeInTheDocument()
  })

  it("displays price filters", async () => {
    const min = 11.1
    const max = 22.2

    render(Filters, { filters: { min, max } })

    const minFilter = screen.getByText(min, { exact: false })
    const maxFilter = screen.getByText(max, { exact: false })
    expect(minFilter).toBeInTheDocument()
    expect(maxFilter).toBeInTheDocument()
  })

  it("displays min price filter only", async () => {
    const min = 11.1

    render(Filters, { filters: { min } })

    const minFilter = screen.getByText(min, { exact: false })
    expect(minFilter).toBeInTheDocument()
  })

  it("displays max price filter only", async () => {
    const max = 22.2

    render(Filters, { filters: { max } })

    const maxFilter = screen.getByText(max, { exact: false })
    expect(maxFilter).toBeInTheDocument()
  })

  it("displays attributes filter", async () => {
    render(Filters, { filters: { attributes: {
      [STRING_ATTRIBUTE.label]: [STRING_ATTRIBUTE.value],
      [CAT_ATTRIBUTE.label]: [CAT_ATTRIBUTE.value],
      [BOOL_ATTRIBUTE.label]: [BOOL_ATTRIBUTE.value],
     } } })

    const category = screen.getByText(
      new RegExp(`^${CAT_ATTRIBUTE.label}.*${CAT_ATTRIBUTE.value}$`),
    )
    const stringAttribute = screen.getByText(
      new RegExp(`^${STRING_ATTRIBUTE.label}.*${STRING_ATTRIBUTE.value}$`),
    )
    const boolAttribute = screen.getByText(
      new RegExp(`^${BOOL_ATTRIBUTE.label}$`),
    )
    expect(category).toBeInTheDocument()
    expect(stringAttribute).toBeInTheDocument()
    expect(boolAttribute).toBeInTheDocument()
  })

  it("supports multiple attribute values", async () => {
    render(Filters, { filters: { attributes: {
      [CAT_ATTRIBUTE.label]: [CAT_ATTRIBUTE.value, BOOL_ATTRIBUTE.value],
      [STRING_ATTRIBUTE.label]: [STRING_ATTRIBUTE.value, BOOL_ATTRIBUTE.value],
     } } })

    const category = screen.getByText(
      new RegExp(`^${CAT_ATTRIBUTE.label}.*${CAT_ATTRIBUTE.value}.*${BOOL_ATTRIBUTE.value}$`),
    )
    const stringAttribute = screen.getByText(
      new RegExp(`^${STRING_ATTRIBUTE.label}.*${STRING_ATTRIBUTE.value}.*${BOOL_ATTRIBUTE.value}$`),
    )
    expect(category).toBeInTheDocument()
    expect(stringAttribute).toBeInTheDocument()
  })

  it("handles filterless search", async () => {
    render(Filters, { filters: {} })

    const undef = screen.queryByText(new RegExp("undefined|null"))
    expect(undef).not.toBeInTheDocument()
  })
})

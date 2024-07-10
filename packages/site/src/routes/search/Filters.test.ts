import "@testing-library/jest-dom/vitest"
import { describe, it, expect, afterEach, vi } from "vitest"
import { render, screen, cleanup } from "@testing-library/svelte"
import { CATEGORY, MockPg, OFFER, TAG, mockDbFixture } from "@tissai/db/mocks"
import { QUERY, SIMILAR, BRAND } from "mocks"
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

  it("displays categories filter", async () => {
    render(Filters, { filters: { category: CATEGORY.name } })

    const categoryName = screen.getByText(CATEGORY.name, { exact: false })
    expect(categoryName).toBeInTheDocument()
  })

  it("displays tags filter", async () => {
    render(Filters, { filters: { tags: [TAG.name] } })

    const tagName = screen.getByText(TAG.name)
    expect(tagName).toBeInTheDocument()
  })

  it("supports multiple tags filter", async () => {
    const tag2 = "myTag"

    render(Filters, { filters: { tags: [TAG.name, tag2] } })

    const tagName = screen.getByText(TAG.name)
    const tag2Name = screen.getByText(tag2)
    expect(tagName).toBeInTheDocument()
    expect(tag2Name).toBeInTheDocument()
  })

  it("handles filterless search", async () => {
    render(Filters, { filters: {} })

    const undef = screen.queryByText(new RegExp("undefined|null"))
    expect(undef).not.toBeInTheDocument()
  })
})

import "@testing-library/jest-dom/vitest"
import { describe, it, expect, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/svelte"
import { ATTRIBUTE } from "@tissai/db/mocks"
import SuggestionTile from "./SuggestionTile.svelte"

const SUGGESTION = {
  frequency: 1,
  label: ATTRIBUTE.label,
  values: [ATTRIBUTE.value],
}
const BASE_URL = "https://example.com/q=a%20search&foo=bar"

describe("SuggestionTile", () => {
  afterEach(() => {
    cleanup()
  })

  it("shows details", async () => {
    render(SuggestionTile, { suggestion: SUGGESTION, baseUrl: BASE_URL })

    const title = screen.getByRole("heading", { level: 3 })
    const chip = screen.getByRole("link")

    expect(title).toHaveTextContent(SUGGESTION.label)
    expect(chip).toHaveTextContent(SUGGESTION.values[0])
    expect(chip).toHaveAttribute(
      "href",
      `${BASE_URL}&${SUGGESTION.label}=${SUGGESTION.values[0]}`,
    )
  })

  it("handles multiple values", async () => {
    const otherValue = "otherValue"
    render(SuggestionTile, {
      baseUrl: BASE_URL,
      suggestion: {
        ...SUGGESTION,
        values: [ATTRIBUTE.value, otherValue],
      },
    })

    const chip1 = screen.getByRole("link", { name: ATTRIBUTE.value })
    const chip2 = screen.getByRole("link", { name: otherValue })

    expect(chip1).toHaveAttribute(
      "href",
      `${BASE_URL}&${SUGGESTION.label}=${ATTRIBUTE.value}`,
    )
    expect(chip2).toHaveAttribute(
      "href",
      `${BASE_URL}&${SUGGESTION.label}=${otherValue}`,
    )
  })
})

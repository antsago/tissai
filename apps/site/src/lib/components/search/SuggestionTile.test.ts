import "@testing-library/jest-dom/vitest"
import { describe, it, expect, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/svelte"
import { SUGGESTION } from "mocks"
import SuggestionTile from "./SuggestionTile.svelte"

const BASE_URL = "https://example.com/q=a%20search&foo=bar"

describe.skip("SuggestionTile", () => {
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
        values: [SUGGESTION.values[0], otherValue],
      },
    })

    const chip1 = screen.getByRole("link", { name: SUGGESTION.values[0] })
    const chip2 = screen.getByRole("link", { name: otherValue })

    expect(chip1).toHaveAttribute(
      "href",
      `${BASE_URL}&${SUGGESTION.label}=${SUGGESTION.values[0]}`,
    )
    expect(chip2).toHaveAttribute(
      "href",
      `${BASE_URL}&${SUGGESTION.label}=${otherValue}`,
    )
  })

  it("url-encodes label and value", async () => {
    render(SuggestionTile, {
      baseUrl: BASE_URL,
      suggestion: {
        ...SUGGESTION,
        label: "the label",
        values: ["a value"],
      },
    })

    const chip = screen.getByRole("link")

    expect(chip).toHaveAttribute("href", `${BASE_URL}&the%20label=a%20value`)
  })
})

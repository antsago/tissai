import { expect, describe, it } from "vitest"
import { PAGE } from "#mocks"
import parsedPage from "./parsedPage.js"
import headings from "./headings.js"

describe("headings", () => {
  it("extracts heading information", () => {
    const headers = {
      title: "The page title",
      description: "The description",
      keywords: "Some, keywords",
      author: "The author",
      robots: "index,follow",
      canonical: PAGE.url,
    }
    const page = {
      ...PAGE,
      body: `
        <html>
          <head>
            <title>${headers.title}</title>
            <meta name="viewport" content="something else">
            <meta name="description" content="${headers.description}">
            <meta name="keywords" content="${headers.keywords}">
            <meta name="author" content="${headers.author}">
            <meta name="robots" content="${headers.robots}">
            <link rel="canonical" href="${headers.canonical}" />
          </head>
        </html>
      `,
    }

    const result = headings(parsedPage(page))

    expect(result).toStrictEqual({
      title: headers.title,
      description: headers.description,
    })
  })

  it("handles empty pages", () => {
    const page = {
      ...PAGE,
      body: `
        <html>
          <head>
          </head>
        </html>
      `,
    }

    const result = headings(parsedPage(page))

    expect(result).toStrictEqual({
      title: undefined,
      description: undefined,
    })
  })
})

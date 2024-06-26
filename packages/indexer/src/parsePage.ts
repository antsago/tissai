import type { Page } from "@tissai/db"
import parsedPage from "./parsedPage.js"
import jsonLd, { type JsonLD } from "./jsonLd.js"
import opengraph, { type OpenGraph } from "./opengraph.js"
import headings, { type Headings } from "./headings.js"

export type StructuredData = {
  jsonLd: JsonLD
  opengraph: OpenGraph
  headings: Headings
}

function parsePage(page: Page): StructuredData {
  const root = parsedPage(page)

  return {
    jsonLd: jsonLd(root),
    headings: headings(root),
    opengraph: opengraph(root),
  }
}

export default parsePage

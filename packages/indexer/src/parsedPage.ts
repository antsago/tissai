import type { Page } from "@tissai/db"
import { HTMLElement, parse } from "node-html-parser"

export type ParsedPage = HTMLElement

function parsedPage(page: Page): ParsedPage {
  return parse(page.body)
}

export default parsedPage

import { parse } from "node-html-parser"
import { Page } from "./Db/index.js"

function parsePage(page: Page) {
  const root = parse(page.body)
  const jsonLd = root
    .querySelectorAll('script[type="application/ld+json"]')
    .map((t) => t.textContent)
    .map((t) => JSON.parse(t))

  return {
    jsonLd,
  }
}

export default parsePage

import type { ParsedPage } from "./parsedPage.js"

export type Headings = Partial<{
  title: string
  description: string
  keywords: string
  author: string
  robots: string
  canonical: string
}>

function headings(parsedPage: ParsedPage): Headings {
  return {
    title: parsedPage.querySelector("title")?.textContent,
    description: parsedPage
      .querySelector('meta[name="description"]')
      ?.getAttribute("content"),
    keywords: parsedPage
      .querySelector('meta[name="keywords"]')
      ?.getAttribute("content"),
    author: parsedPage
      .querySelector('meta[name="author"]')
      ?.getAttribute("content"),
    robots: parsedPage
      .querySelector('meta[name="robots"]')
      ?.getAttribute("content"),
    canonical: parsedPage
      .querySelector('link[rel="canonical"]')
      ?.getAttribute("href"),
  }
}

export default headings

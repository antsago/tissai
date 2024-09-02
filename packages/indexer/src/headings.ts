import { type HTMLElement } from "node-html-parser"

export type Headings = Partial<{
  title: string
  description: string
}>

function headings(parsedPage: HTMLElement): Headings {
  const headers = {
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

  return {
    title: headers.title,
    description: headers.description,
  }
}

export default headings

const { JSDOM } = require("jsdom")

const Content = function (url, htlmText) {
  const site = new JSDOM(htlmText)
  const tags = [
    ...site.window.document.querySelectorAll(
      'script[type="application/ld+json"]',
    ),
  ]
  const jsonLD = tags.map((tag) => tag.text).map(JSON.parse)
  const headings = {
    title: site.window.document?.head.querySelector("title")?.text,
    description: site.window.document?.head.querySelector(
      'meta[name="description"]',
    )?.content,
    keywords: site.window.document?.head.querySelector('meta[name="keywords"]')
      ?.content,
    author: site.window.document?.head.querySelector('meta[name="author"]')
      ?.content,
    robots: site.window.document?.head.querySelector('meta[name="robots"]')
      ?.content,
    canonical: site.window.document?.head.querySelector('link[rel="canonical"]')
      ?.href,
  }

  return {
    url,
    jsonLD,
    headings,
  }
}

module.exports = Content

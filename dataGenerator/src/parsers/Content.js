const { JSDOM } = require("jsdom")

const Content = function (url, htlmText) {
  const site = new JSDOM(htlmText)
  const tags = [
    ...site.window.document.querySelectorAll(
      'script[type="application/ld+json"]',
    ),
  ]
  const jsonLD = tags.map((tag) => tag.text).map(JSON.parse)

  return {
    url,
    jsonLD,
  }
}

module.exports = Content

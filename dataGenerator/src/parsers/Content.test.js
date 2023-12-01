const Content = require("./Content")

describe("Content", () => {
  const url = `https://example.com/url1`
  
  const baseExpected = {
    url,
    jsonLD: [],
    headings: {},
  }

  it("extracts jsonLD", async () => {
    const linkedData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Menpants",
          item: "https://es.shein.com/category/Menpants-sc-008113048.html",
        },
      ],
    }
    const html = `<script type="application/ld+json">${JSON.stringify(linkedData,)}</script>`

    const result = Content(url, html)

    expect(result).toStrictEqual({
      ...baseExpected,
      jsonLD: [linkedData],
    })
  })

  it.only("extracts meta tag information", async () => {
    const headings = {
      title: "The page title",
      description: "The description",
      keywords: "Some, keywords",
      author: "The author",
      robots: "index,follow",
      canonical: url,
    }
    const html = `
      <head>
        <title>${headings.title}</title>
        <meta name="viewport" content="something else">
        <meta name="description" content="${headings.description}">
        <meta name='keywords' content='${headings.keywords}'>
        <meta name='author' content='${headings.author}'>
        <meta name="robots" content="${headings.robots}">
        <link rel="canonical" href="${url}" />
      </head>
    `

    const result = Content(url, html)

    expect(result).toStrictEqual({
      ...baseExpected,
      headings,
    })
  })
})

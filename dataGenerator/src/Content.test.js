const Content = require("./Content")

describe("Content", () => {
  it("extracts data", async () => {
    const url = `https://example.com/url1`
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
    const html = `<script type="application/ld+json">${JSON.stringify(
      linkedData,
    )}</script>`

    const result = Content(url, html)

    expect(result).toStrictEqual({
      url,
      linkedData: [linkedData],
    })
  })
})

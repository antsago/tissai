const Content = require("./Content")

describe("Content", () => {
  const url = `https://example.com/url1`

  const baseExpected = {
    url,
    jsonLD: [],
    headings: expect.any(Object),
    openGraph: expect.any(Object),
    raw: expect.any(String),
    html: expect.any(Object),
  }

  it("return raw content", async () => {
    const html = `<html><head></head><body></body></html>`

    const result = Content(url, html)

    expect(result).toStrictEqual({
      ...baseExpected,
      raw: html,
    })
  })

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
    const html = `<html><script type="application/ld+json">${JSON.stringify(
      linkedData,
    )}</script></html>`

    const result = Content(url, html)

    expect(result).toStrictEqual({
      ...baseExpected,
      jsonLD: [linkedData],
    })
  })

  it("extracts heading information", async () => {
    const headings = {
      title: "The page title",
      description: "The description",
      keywords: "Some, keywords",
      author: "The author",
      robots: "index,follow",
      canonical: url,
    }
    const html = `
      <html>
      <head>
        <title>${headings.title}</title>
        <meta name="viewport" content="something else">
        <meta name="description" content="${headings.description}">
        <meta name='keywords' content='${headings.keywords}'>
        <meta name='author' content='${headings.author}'>
        <meta name="robots" content="${headings.robots}">
        <link rel="canonical" href="${url}" />
      </head>
      </html>
    `

    const result = Content(url, html)

    expect(result).toStrictEqual({
      ...baseExpected,
      headings,
    })
  })

  it("extracts opengraph information", async () => {
    const openGraph = {
      type: "og:product",
      title: "Friend Smash Coin",
      image: "http://www.friendsmash.com/images/coin_600.png",
      description: "Friend Smash Coins to purchase upgrades and items!",
      url: "http://www.friendsmash.com/og/coins.html",
      pluralTitle: "Friend Smash Coins",
      price: [
        {
          amount: 0.3,
          currency: "USD",
        },
        {
          amount: 0.2,
          currency: "GBP",
        },
      ],
    }
    const html = `
      <html>
      <head>
        <meta property="og:type"                   content="${openGraph.type}" />
        <meta property="og:title"                  content="${openGraph.title}" />
        <meta property="og:image"                  content="${openGraph.image}" />
        <meta property="og:description"            content="${openGraph.description}" />
        <meta property="og:url"                    content="${openGraph.url}" />
        <meta property="product:plural_title"      content="${openGraph.pluralTitle}" />
        <meta property="product:price:amount"      content="${openGraph.price[0].amount}"/>
        <meta property="product:price:currency"    content="${openGraph.price[0].currency}"/>
        <meta property="product:price:amount"      content="${openGraph.price[1].amount}"/>
        <meta property="product:price:currency"    content="${openGraph.price[1].currency}"/>
      </head>
      </html>
    `

    const result = Content(url, html)

    expect(result).toStrictEqual({
      ...baseExpected,
      openGraph,
    })
  })
  
  describe('html parsing', () => {
    it("supports empty pages", async () => {
      const html = ""  

      const result = Content(url, html)
  
      expect(result).toStrictEqual({
        ...baseExpected,
        html: []
      })
    })

    it("identifies text nodes", async () => {
      const html = "some text"  

      const result = Content(url, html)
  
      expect(result).toStrictEqual({
        ...baseExpected,
        html: [{
          type: 'text',
          content: html, 
        }]
      })
    })

    it("identifies image nodes", async () => {
      const src = "image/src"
      const alt = "the alt"
      const html = `<img class="some clases" src="${src}" alt="${alt}">`

      const result = Content(url, html)
  
      expect(result).toStrictEqual({
        ...baseExpected,
        html: [{
          type: 'image',
          src, 
          alt,
        }]
      })
    })

    it("supports missing alt attribute", async () => {
      const src = "image/src"
      const html = `<img class="some clases" src="${src}">`

      const result = Content(url, html)
  
      expect(result).toStrictEqual({
        ...baseExpected,
        html: [{
          type: 'image',
          src, 
          alt: "",
        }]
      })
    })
  })
})

const Content = require("./Content")

describe("Content", () => {
  const url = `https://example.com/url1`

  const baseExpected = {
    url,
    jsonLD: [],
    headings: expect.any(Object),
    openGraph: expect.any(Object),
    raw: expect.any(String),
    html: expect.any(Array),
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

  describe("html parsing", () => {
    it("supports empty pages", async () => {
      const html = ""

      const result = Content(url, html)

      expect(result).toStrictEqual({
        ...baseExpected,
        html: [],
      })
    })

    it("identifies text nodes", async () => {
      const html = "some text"

      const result = Content(url, html)

      expect(result).toStrictEqual({
        ...baseExpected,
        html: [
          {
            type: "text",
            content: html,
            headerLevel: 0,
          },
        ],
      })
    })

    it("identifies image nodes", async () => {
      const src = "image/src"
      const alt = "the alt"
      const html = `<img class="some clases" src="${src}" alt="${alt}">`

      const result = Content(url, html)

      expect(result).toStrictEqual({
        ...baseExpected,
        html: [
          {
            type: "image",
            srcset: "",
            src,
            alt,
          },
        ],
      })
    })

    it("supports missing alt attribute", async () => {
      const src = "image/src"
      const html = `<img class="some clases" src="${src}">`

      const result = Content(url, html)

      expect(result).toStrictEqual({
        ...baseExpected,
        html: [
          {
            type: "image",
            srcset: "",
            src,
            alt: "",
          },
        ],
      })
    })

    it("ignores images without src", async () => {
      const html = `<img class="some clases">`

      const result = Content(url, html)

      expect(result).toStrictEqual({
        ...baseExpected,
        html: [[]],
      })
    })

    it("supports srcsets", async () => {
      const src = "image/src"
      const alt = "the alt"
      const srcset = "src 11w, set"
      const html = `<img src="${src}" srcset="${srcset}" sizes="(min-width: 600px) 56px, 1px" alt="${alt}">`

      const result = Content(url, html)

      expect(result).toStrictEqual({
        ...baseExpected,
        html: [
          {
            type: "image",
            srcset,
            src,
            alt,
          },
        ],
      })
    })

    it("supports srcset only", async () => {
      const alt = "the alt"
      const srcset = "src 11w, set"
      const html = `<img srcset="${srcset}" sizes="(min-width: 600px) 56px, 1px" alt="${alt}">`

      const result = Content(url, html)

      expect(result).toStrictEqual({
        ...baseExpected,
        html: [
          {
            type: "image",
            srcset,
            src: "",
            alt,
          },
        ],
      })
    })

    it("supports sibling nodes", async () => {
      const text = "some text"
      const src = "image/src"
      const html = `<img class="some clases" src="${src}">${text}`

      const result = Content(url, html)

      expect(result).toStrictEqual({
        ...baseExpected,
        html: [
          {
            type: "image",
            srcset: "",
            src,
            alt: "",
          },
          {
            type: "text",
            content: text,
            headerLevel: 0,
          },
        ],
      })
    })

    it("parses nodes recursively", async () => {
      const text = "some text"
      const html = `<div>${text}</div>`

      const result = Content(url, html)

      expect(result).toStrictEqual({
        ...baseExpected,
        html: [
          [
            {
              type: "text",
              content: text,
              headerLevel: 0,
            },
          ],
        ],
      })
    })

    it("ignores head", async () => {
      const text = "some text"
      const html = `<html><head></head><body><div>${text}</div></body>`

      const result = Content(url, html)

      expect(result).toStrictEqual({
        ...baseExpected,
        html: [
          [
            {
              type: "text",
              content: text,
              headerLevel: 0,
            },
          ],
        ],
      })
    })

    it("ignores comment and script content", async () => {
      const text = "some text"
      const html = `<script>script text</script>${text}<!-- A comment -->`

      const result = Content(url, html)

      expect(result).toStrictEqual({
        ...baseExpected,
        html: [
          {
            type: "text",
            content: text,
            headerLevel: 0,
          },
          [],
        ],
      })
    })

    it.each([1, 2, 3, 4, 5, 6])(
      "identifies headers level %s",
      async (level) => {
        const text = "some text"
        const html = `<h${level}>${text}</h${level}>`

        const result = Content(url, html)

        expect(result).toStrictEqual({
          ...baseExpected,
          html: [
            [
              {
                type: "text",
                content: text,
                headerLevel: level,
              },
            ],
          ],
        })
      },
    )

    it("identifies links", async () => {
      const text = "some text"
      const href = "https://some.link/"
      const html = `<a href="${href}">${text}</a>`

      const result = Content(url, html)

      expect(result).toStrictEqual({
        ...baseExpected,
        html: [
          {
            type: "link",
            href,
            children: [
              {
                type: "text",
                content: text,
                headerLevel: 0,
              },
            ]
          }
        ],
      })
    })
  })
})

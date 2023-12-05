const { JSDOM } = require("jsdom")
const rawParseHtml = require("./parseHtml")

describe("Content", () => {
  const parseHtml = (html) => rawParseHtml(new JSDOM(html).window.document)

  it("supports empty pages", async () => {
    const html = ""

    const result = parseHtml(html)

    expect(result).toStrictEqual([])
  })

  it("identifies text nodes", async () => {
    const html = "some text"

    const result = parseHtml(html)

    expect(result).toStrictEqual([
      {
        type: "text",
        content: html,
        headerLevel: 0,
      },
    ])
  })

  it("identifies image nodes", async () => {
    const src = "image/src"
    const alt = "the alt"
    const html = `<img class="some clases" src="${src}" alt="${alt}">`

    const result = parseHtml(html)

    expect(result).toStrictEqual([
      {
        type: "image",
        srcset: "",
        src,
        alt,
      },
    ])
  })

  it("supports missing alt attribute", async () => {
    const src = "image/src"
    const html = `<img class="some clases" src="${src}">`

    const result = parseHtml(html)

    expect(result).toStrictEqual([
      {
        type: "image",
        srcset: "",
        src,
        alt: "",
      },
    ])
  })

  it("ignores images without src", async () => {
    const html = `<img class="some clases">`

    const result = parseHtml(html)

    expect(result).toStrictEqual([])
  })

  it("supports srcsets", async () => {
    const src = "image/src"
    const alt = "the alt"
    const srcset = "src 11w, set"
    const html = `<img src="${src}" srcset="${srcset}" sizes="(min-width: 600px) 56px, 1px" alt="${alt}">`

    const result = parseHtml(html)

    expect(result).toStrictEqual([
      {
        type: "image",
        srcset,
        src,
        alt,
      },
    ])
  })

  it("supports srcset only", async () => {
    const alt = "the alt"
    const srcset = "src 11w, set"
    const html = `<img srcset="${srcset}" sizes="(min-width: 600px) 56px, 1px" alt="${alt}">`

    const result = parseHtml(html)

    expect(result).toStrictEqual([
      {
        type: "image",
        srcset,
        src: "",
        alt,
      },
    ])
  })

  it("supports sibling nodes", async () => {
    const text = "some text"
    const src = "image/src"
    const html = `<img class="some clases" src="${src}">${text}`

    const result = parseHtml(html)

    expect(result).toStrictEqual([
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
    ])
  })

  it("parses nodes recursively", async () => {
    const text = "some text"
    const html = `<div>${text}</div>`

    const result = parseHtml(html)

    expect(result).toStrictEqual([
      {
        type: "text",
        content: text,
        headerLevel: 0,
      },
    ])
  })

  it("preserves nodes with multiple children", async () => {
    const text = "some text"
    const html = `<div><span>${text}</span><span>${text}</span></div>`

    const result = parseHtml(html)

    expect(result).toStrictEqual([
      [
        {
          type: "text",
          content: text,
          headerLevel: 0,
        },
        {
          type: "text",
          content: text,
          headerLevel: 0,
        },
      ],
    ])
  })

  it("removes empty branches", async () => {
    const html = `<div></div>`

    const result = parseHtml(html)

    expect(result).toStrictEqual([])
  })

  it("ignores whitespace text", async () => {
    const text = "\n    \n   "
    const html = `<div>${text}</div>`

    const result = parseHtml(html)

    expect(result).toStrictEqual([])
  })

  it("ignores head", async () => {
    const text = "some text"
    const html = `<html><head></head><body><div>${text}</div></body>`

    const result = parseHtml(html)

    expect(result).toStrictEqual([
      {
        type: "text",
        content: text,
        headerLevel: 0,
      },
    ])
  })

  it("ignores comment and script content", async () => {
    const text = "some text"
    const html = `
      <body>
        <script>script text</script><!-- A comment -->
      </body>
      <script>script text</script><!-- A comment -->
    `

    const result = parseHtml(html)

    expect(result).toStrictEqual([])
  })

  it.each([1, 2, 3, 4, 5, 6])("identifies headers level %s", async (level) => {
    const text = "some text"
    const html = `<h${level}>${text}</h${level}>`

    const result = parseHtml(html)

    expect(result).toStrictEqual([
      {
        type: "text",
        content: text,
        headerLevel: level,
      },
    ])
  })

  it("identifies links", async () => {
    const text = "some text"
    const href = "https://some.link/"
    const html = `<a href="${href}">${text}</a>`

    const result = parseHtml(html)

    expect(result).toStrictEqual([
      {
        type: "link",
        href,
        children: [
          {
            type: "text",
            content: text,
            headerLevel: 0,
          },
        ],
      },
    ])
  })

  it("ignores links without href", async () => {
    const text = "some text"
    const html = `<a href="">${text}</a>`

    const result = parseHtml(html)

    expect(result).toStrictEqual([
      {
        type: "text",
        content: text,
        headerLevel: 0,
      },
    ])
  })
})

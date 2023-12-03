const { JSDOM } = require("jsdom")

const parseJsonLD = (document) => {
  const tags = [
    ...document?.querySelectorAll('script[type="application/ld+json"]'),
  ]

  return tags.map((tag) => tag.text).map(JSON.parse)
}

const parseHeadings = (document) => {
  const head = document?.head

  return {
    title: head?.querySelector("title")?.text,
    description: head?.querySelector('meta[name="description"]')?.content,
    keywords: head?.querySelector('meta[name="keywords"]')?.content,
    author: head?.querySelector('meta[name="author"]')?.content,
    robots: head?.querySelector('meta[name="robots"]')?.content,
    canonical: head?.querySelector('link[rel="canonical"]')?.href,
  }
}

const getPriceInfo = (tag) => {
  const property = tag.attributes.property.value

  if (property === "product:price:amount") {
    return { amount: parseFloat(tag.content) }
  }
  if (property === "product:price:currency") {
    return { currency: tag.content }
  }

  return {}
}

const parseOpenGraph = (document) => {
  const head = document?.head

  return {
    type: head?.querySelector('meta[property="og:type"]')?.content,
    title: head?.querySelector('meta[property="og:title"]')?.content,
    image: head?.querySelector('meta[property="og:image"]')?.content,
    description: head?.querySelector('meta[property="og:description"]')
      ?.content,
    url: head?.querySelector('meta[property="og:url"]')?.content,
    pluralTitle: head?.querySelector('meta[property="product:plural_title"]')
      ?.content,
    price: [
      ...head?.querySelectorAll('meta[property^="product:price:"]'),
    ].reduce((priceArray, tag, index) => {
      const info = getPriceInfo(tag)
      if (index % 2 === 0) {
        return [...priceArray, info]
      }
      return [...priceArray.slice(0, -1), { ...priceArray.at(-1), ...info }]
    }, []),
  }
}

const parseHtml = (document) => {
  const parseNode = (node, headerLevel) => {
    const name = node.nodeName
    if (name === "IMG" && (node.src || node.srcset)) {
      return {
        type: "image",
        src: node.src,
        alt: node.alt,
        srcset: node.srcset,
      }
    }

    if (name === "#text") {
      return {
        type: "text",
        content: node.textContent,
        headerLevel,
      }
    }

    const isHeader = name.length === 2 && name.startsWith("H")
    const childHeaderLevel = isHeader ? parseInt(name[1], 10) : headerLevel
    const children = [...node.childNodes]
      .map((child) => parseNode(child, childHeaderLevel))
      .filter((n) => !!n)

    if (name === "A") {
      return {
        type: "link",
        href: node.href,
        children,
      }
    }

    return children
  }

  return parseNode(document.body, 0)
}

const Content = function (url, raw) {
  const document = new JSDOM(raw).window.document

  const jsonLD = parseJsonLD(document)
  const headings = parseHeadings(document)
  const openGraph = parseOpenGraph(document)
  const html = parseHtml(document)

  return {
    url,
    jsonLD,
    headings,
    openGraph,
    raw,
    html,
  }
}

module.exports = Content

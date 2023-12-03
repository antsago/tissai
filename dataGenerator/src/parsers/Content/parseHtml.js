const childHLevel = (node, parentHLevel) => {
  const name = node.nodeName
  const isHeader = name.length === 2 && name.startsWith("H")
  return isHeader ? parseInt(name[1], 10) : parentHLevel
}

const parseNode = (node, hLevel) => {
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
      headerLevel: hLevel,
    }
  }

  const children = [...node.childNodes]
    .map((child) => parseNode(child, childHLevel(node, hLevel)))
    .filter((n) => !!n)

  if (name === "A" && node.href) {
    return {
      type: "link",
      href: node.href,
      children,
    }
  }

  return children
}

module.exports = (document) => parseNode(document.body, 0)

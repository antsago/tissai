const IS_WHITESPACE = /^\s*$/
const TAGS_TO_IGNORE = ["SCRIPT", "#comment"]

const childHLevel = (node, parentHLevel) => {
  const name = node.nodeName
  const isHeader = name.length === 2 && name.startsWith("H")
  return isHeader ? parseInt(name[1], 10) : parentHLevel
}

const parseNode = (node, hLevel) => {
  const name = node.nodeName

  if (TAGS_TO_IGNORE.includes(name)) {
    return []
  }

  if (name === "IMG" && (node.src || node.srcset)) {
    return {
      type: "image",
      src: node.src,
      alt: node.alt,
      srcset: node.srcset,
    }
  }

  if (name === "#text" && !IS_WHITESPACE.test(node.textContent)) {
    return {
      type: "text",
      content: node.textContent,
      headerLevel: hLevel,
    }
  }

  const children = [...node.childNodes]
    .map((child) => parseNode(child, childHLevel(node, hLevel)))
    .filter((child) => !Array.isArray(child) || child.length > 0)
    .map((child) =>
      Array.isArray(child) && child.length === 1 ? child[0] : child,
    )

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

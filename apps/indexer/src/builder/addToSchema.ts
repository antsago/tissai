function commonStartBetween(a: string[], b: string[]) {
  let common = [] as string[]
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return common
    }

    common = [...common, a[i]]
  }

  return common
}

const hasSubstring = (title: string[], substring: string[]) => {
  for (let startIndex = 0; startIndex < title.length; startIndex += 1) {
    const match = commonStartBetween(title.slice(startIndex), substring)

    if (match.length === substring.length) {
      return title.toSpliced(startIndex, substring.length)
    }
  }

  return title
}

export type Node = {
  name: string[]
  children: Node[]
  properties: Node[]
}

function matchProperties(words: string[], properties: Node[]) {
  const matchedProperties = [] as Node[]

  const remainingWords = properties.reduce((nonMatchedWords, property) => {
    if (!nonMatchedWords.length) {
      return nonMatchedWords
    }

    const match = hasSubstring(nonMatchedWords, property.name)

    if (match.length < nonMatchedWords.length) {
      matchedProperties.push(property)
    }
    return match
  }, words)

  return { remainingWords, matchedProperties }
}

function matchNode(words: string[], node: Node) {
  const common = commonStartBetween(words, node.name)

  if (common.length) {
    const remainingWords =
      common.length < words.length && words.slice(common.length)
    const remainingName =
      common.length < node.name.length && node.name.slice(common.length)

    if (!remainingWords) {
      return {
        common,
        remainingName,
        remainingWords,
      }
    }

    const nonMatched = matchProperties(remainingWords, node.properties)

    return {
      common,
      remainingName,
      remainingWords: nonMatched.remainingWords,
    }
  }
}
type Match = NonNullable<ReturnType<typeof matchNode>>

function updateNode(node: Node, match: Match): Node {
  if (match.remainingName && match.remainingWords) {
    return {
      name: match.common,
      properties: [],
      children: [
        {
          name: match.remainingName,
          properties: [],
          children: node.children,
        },
        {
          name: match.remainingWords,
          properties: [],
          children: [],
        },
      ],
    }
  }

  if (match.remainingName) {
    return {
      name: match.common,
      properties: [],
      children: [
        {
          name: match.remainingName,
          children: node.children,
          properties: [],
        },
      ],
    }
  }

  if (match.remainingWords) {
    const { children, newProperties } = updateChildren(
      match.remainingWords,
      node.children,
    )

    return {
      name: node.name,
      children,
      properties: [...node.properties, ...newProperties],
    }
  }

  return node
}

function matchChildren(children: Node[], otherNodes: Node[]) {
  const common = [] as Node[]
  const remaining = [] as Node[]

  const updatedNodes = children.reduce((nodes, child) => {
    let isChildMatched = false
    const filteredNodes = nodes.map(({ children: nodeChildren, ...node }) => ({
      ...node,
      children: nodeChildren.filter((otherChild) => {
        const match = commonStartBetween(child.name, otherChild.name)

        if (match.length === child.name.length) {
          isChildMatched = true
          return false
        }

        return true
      }),
    }))

    if (isChildMatched) {
      common.push(child)
    } else {
      remaining.push(child)
    }

    return filteredNodes
  }, otherNodes)

  return {
    commonChildren: common,
    remainingChildren: remaining,
    updatedNodes,
  }
}

function updateChildren(
  words: string[],
  nodes: Node[],
): { children: Node[]; newProperties: Node[] } {
  for (let [index, node] of nodes.entries()) {
    const match = matchNode(words, node)
    if (match) {
      const updated = updateNode(node, match)
      const { commonChildren, updatedNodes, remainingChildren } = matchChildren(
        updated.children,
        nodes.toSpliced(index, 1),
      )

      const finalNode = {
        ...updated,
        children: remainingChildren,
      }

      return {
        children: updatedNodes.toSpliced(index, 0, finalNode),
        newProperties: commonChildren,
      }
    }
  }

  return {
    newProperties: [],
    children: [
      ...nodes,
      {
        name: words,
        properties: [],
        children: [],
      },
    ],
  }
}

export function addToSchema(title: string, schema: Node[]) {
  const words = title.split(" ")
  return updateChildren(words, schema).children
}

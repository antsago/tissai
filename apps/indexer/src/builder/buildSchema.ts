function commonWordsBetween(a: string[], b: string[]) {
  let common = [] as string[]
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return common
    }

    common = [...common, a[i]]
  }

  return common
}

type Node = { name: string[]; children: Node[] }

function matchNode(words: string[], node: Node) {
  const common = commonWordsBetween(words, node.name)

  if (common.length) {
    return {
      common,
      remainingName: node.name.slice(common.length),
      remainingWords: words.slice(common.length),
    }
  }
}
type Match = NonNullable<ReturnType<typeof matchNode>>

function updateNode(node: Node, match: Match): Node {
  if (match.remainingName.length && match.remainingWords.length) {
    return {
      name: match.common,
      children: [
        {
          name: match.remainingName,
          children: node.children,
        },
        {
          name: match.remainingWords,
          children: [],
        }
      ]
    }
  }

  if (match.remainingName.length) {
    return {
      name: match.common,
      children: [
        {
          name: match.remainingName,
          children: node.children,
        },
      ]
    }
  }

  if (match.remainingWords.length) {
    return {
      name: node.name,
      children: updateChildren(match.remainingWords, node.children)
    }
  }

  return node
}

function updateChildren(words: string[], nodes: Node[]): Node[] {
  for (let [index, node] of nodes.entries()) {
    const match = matchNode(words, node)
    if (match) {
      const updated = updateNode(node, match)
      return nodes.with(index, updated)
    }
  }

  return [...nodes, { name: words, children: [] }]
}

export function buildSchema(titles: string[]) {
  let rootNodes = [] as Node[]

  for (let title of titles) {
    const words = title.split(" ")
    rootNodes = updateChildren(words, rootNodes)
  }

  return rootNodes
}

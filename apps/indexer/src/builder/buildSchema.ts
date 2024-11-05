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

function buildNode(words: string[], node: Node): Node|undefined {
  const match = commonWordsBetween(words, node.name)

  // no match
  if (!match.length) {
    return
  }

  // Full match
  if (match.length === node.name.length && match.length === words.length) {
    return node
  }

  // name and remaining left
  if (match.length < words.length && match.length < node.name.length) {
    return {
      name: match,
      children: [
        {
          name: node.name.slice(match.length),
          children: node.children,
        },
        {
          name: words.slice(match.length),
          children: [],
        }
      ]
    }
  }

  // name left
  if (match.length < node.name.length) {
    return {
      name: match,
      children: [
        {
          name: node.name.slice(match.length),
          children: node.children,
        },
      ]
    }
  }

  // remaining left
  if (match.length < words.length) {
    return {
      name: match,
      children: buildChildren(words.slice(match.length), node.children)
    }
  }
}

function buildChildren(words: string[], nodes: Node[]): Node[] {
  for (let [index, node] of nodes.entries()) {
    const match = buildNode(words, node)
    if (match) {
      return nodes.with(index, match)
    }
  }

  return [...nodes, { name: words, children: [] }]
}

export function buildSchema(titles: string[]) {
  let rootNodes = [] as Node[]

  for (let title of titles) {
    const words = title.split(" ")
    rootNodes = buildChildren(words, rootNodes)
  }

  return rootNodes
}

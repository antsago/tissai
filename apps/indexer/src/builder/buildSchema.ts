import { randomUUID, type UUID } from "crypto"
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

type Node = {
  id: UUID
  name: string[]
  parent: UUID | null
  children: Node[]
}

function matchNode(words: string[], node: Node) {
  const common = commonWordsBetween(words, node.name)

  if (common.length) {
    return {
      common,
      remainingName:
        common.length < node.name.length && node.name.slice(common.length),
      remainingWords:
        common.length < words.length && words.slice(common.length),
    }
  }
}
type Match = NonNullable<ReturnType<typeof matchNode>>

function updateNode(node: Node, match: Match, parent: UUID | null): Node {
  if (match.remainingName && match.remainingWords) {
    const id = randomUUID()
    const childId = randomUUID()
    return {
      id,
      parent,
      name: match.common,
      children: [
        {
          id: childId,
          parent: id,
          name: match.remainingName,
          children: node.children.map((c) => ({ ...c, parent: childId })),
        },
        {
          id: randomUUID(),
          parent: id,
          name: match.remainingWords,
          children: [],
        },
      ],
    }
  }

  if (match.remainingName) {
    const id = randomUUID()
    const childId = randomUUID()
    return {
      id,
      name: match.common,
      parent,
      children: [
        {
          id: childId,
          name: match.remainingName,
          parent: id,
          children: node.children.map((c) => ({ ...c, parent: childId })),
        },
      ],
    }
  }

  if (match.remainingWords) {
    const id = randomUUID()
    return {
      id,
      name: node.name,
      parent: node.parent,
      children: updateChildren(
        match.remainingWords,
        node.children.map((c) => ({ ...c, parent: id })),
        id,
      ),
    }
  }

  return node
}

function updateChildren(
  words: string[],
  nodes: Node[],
  parent: UUID | null,
): Node[] {
  for (let [index, node] of nodes.entries()) {
    const match = matchNode(words, node)
    if (match) {
      const updated = updateNode(node, match, parent)
      return nodes.with(index, updated)
    }
  }

  return [
    ...nodes,
    {
      id: randomUUID(),
      name: words,
      parent,
      children: [],
    },
  ]
}

export function buildSchema(titles: string[]) {
  let rootNodes = [] as Node[]

  for (let title of titles) {
    const words = title.split(" ")
    rootNodes = updateChildren(words, rootNodes, null)
  }

  return rootNodes
}

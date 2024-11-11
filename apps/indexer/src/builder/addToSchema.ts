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

export type Node = {
  id: UUID
  name: string[]
  parent: UUID | null
  children: Node[]
  properties?: Node[]
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
    const id = node.id
    const { children, newProperty } = updateChildren(
        match.remainingWords,
        node.children.map((c) => ({ ...c, parent: id })),
        id,
      )
    
    if(newProperty) {
      return {
        id,
        name: node.name,
        parent: node.parent,
        children,
        properties: [...node.properties ?? [], newProperty],
      }
    }

    return {
      id,
      name: node.name,
      parent: node.parent,
      children,
    }
  }

  return node
}

function findCommonSubcategories(nodes: Node[], forIndex: number) {
  const newChild = nodes[forIndex].children.at(-1)
  if (!newChild) {
    return 
  }

  for (let [index, node] of nodes.entries()) {
    if (index === forIndex) {
      continue
    }

    const commonSubcategory = node.children.findIndex(child => {
      const match = commonWordsBetween(child.name, newChild.name)
      return match.length === newChild.name.length
    })

    if (commonSubcategory !== -1) {
      return [index, commonSubcategory] as const
    }
  }
}

function updateChildren(
  words: string[],
  nodes: Node[],
  parent: UUID | null,
): { children: Node[], newProperty?: Node } {
  for (let [index, node] of nodes.entries()) {
    const match = matchNode(words, node)
    if (match) {
      const updated = updateNode(node, match, parent)
      const newNodes = nodes.with(index, updated)

      const commonSubcategory = findCommonSubcategories(newNodes, index)

      if (!commonSubcategory) {
        return {
          children: newNodes,
        }
      }

      const newChild = newNodes[index].children.splice(-1)
      const existingChild = newNodes[commonSubcategory[0]].children.splice(commonSubcategory[1])

      return {
        children: newNodes,
        newProperty: {
          id: randomUUID(),
          parent,
          children: [],
          name: newChild[0].name,
        }
      }
    }
  }

  return {
    children: [
    ...nodes,
    {
      id: randomUUID(),
      name: words,
      parent,
      children: [],
    },
  ],
  }
}

export function addToSchema(title: string, schema: Node[]) {
  const words = title.split(" ")
  return updateChildren(words, schema, null).children
}
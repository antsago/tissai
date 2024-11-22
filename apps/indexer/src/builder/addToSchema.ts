function commonStartBetween(a: string[], b: string[]) {
  let common = [] as string[]
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] === undefined || a[i] !== b[i]) {
      return common
    }

    common = [...common, a[i]]
  }

  return common
}

export type Node = {
  name: string[]
  children: Node[]
  properties: Node[]
}

type Interpretation = { index: number; matched: string[] }[]

function removeProperties(words: string[], properties: Node[]) {
  return words.filter((word) =>
    properties.every((property) => property.name[0] !== word),
  )
}

function interpret(
  words: string[],
  schema: Node,
): { remainingWords: string[]; path: Interpretation } {
  const unmatchedWords = removeProperties(words, schema.properties)

  for (let [index, child] of schema.children.entries()) {
    const matched = commonStartBetween(unmatchedWords, child.name)
    if (!matched.length) {
      continue
    }

    const { remainingWords, path } = interpret(
      unmatchedWords.slice(matched.length),
      child,
    )

    return {
      remainingWords,
      path: [
        {
          index,
          matched,
        },
        ...path,
      ],
    }
  }

  return { remainingWords: unmatchedWords, path: [] }
}

function addNewNode(words: string[], path: Interpretation, schema: Node): Node {
  if (!words.length) {
    return schema
  }

  if (!path.length) {
    return {
      ...schema,
      children: [
        ...schema.children,
        { name: words, children: [], properties: [] },
      ],
    }
  }

  const { index } = path[0]
  const child = addNewNode(words, path.slice(1), schema.children[index])

  return {
    ...schema,
    children: schema.children.with(index, child),
  }
}

function splitNodes(path: Interpretation, schema: Node): Node {
  if (!path.length) {
    return schema
  }

  const { index, matched } = path[0]
  const child = splitNodes(path.slice(1), schema.children[index])

  const newChild: Node =
    matched.length === child.name.length
      ? child
      : {
          name: matched,
          children: [
            {
              ...child,
              name: child.name.slice(matched.length),
            },
          ],
          properties: [],
        }

  return {
    ...schema,
    children: schema.children.with(index, newChild),
  }
}

function extractProperties(path: Interpretation, schema: Node): Node {
  if (!path.length) {
    return schema
  }

  const { index } = path[0]
  const child = extractProperties(path.slice(1), schema.children[index])

  const siblings = schema.children.toSpliced(index, 1)
  const subcategoryMatching = child.children.map((child) =>
    siblings.map((sibling) => {
      const match = sibling.children.findIndex(
        (cousin) => !!commonStartBetween(child.name, cousin.name).length,
      )
      return match >= index ? match + 1 : match
    }),
  )

  const newProperties = child.children.filter((_, childIndex) =>
    subcategoryMatching[childIndex].some((match) => match !== -1),
  )

  const updatedChild = {
    ...child,
    children: child.children.filter((_, childIndex) =>
      subcategoryMatching[childIndex].every((match) => match === -1),
    ),
  }

  return {
    ...schema,
    properties: [...schema.properties, ...newProperties],
    children: schema.children.map((node, nodeIndex) => {
      if (nodeIndex === index) {
        return updatedChild
      }

      const children = node.children.filter((_, childIndex) =>
        subcategoryMatching.every((match) => match[childIndex] !== nodeIndex),
      )
      return {
        ...node,
        children,
      }
    }),
  }
}

export function addToSchema(title: string, schema: Node) {
  const words = title.split(" ")
  const { remainingWords, path } = interpret(words, schema)
  let updatedSchema = schema
  updatedSchema = splitNodes(path, schema)
  updatedSchema = addNewNode(remainingWords, path, updatedSchema)
  updatedSchema = extractProperties(path, updatedSchema)
  return updatedSchema
}

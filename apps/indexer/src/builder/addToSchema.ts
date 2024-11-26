import { type UUID } from "node:crypto"
import type { Node, Schema } from "./nodesToSchema.js"

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

type Interpretation = {
  node: UUID
  matched: string[]
}[]

function removeProperties(words: string[], properties: Node[]) {
  return words.filter((word) =>
    properties.every((property) => property.name[0] !== word),
  )
}

function interpret(
  words: string[],
  parentId: UUID,
  schema: Schema,
): { remainingWords: string[]; path: Interpretation } {
  const unmatchedWords = removeProperties(words, schema.propertiesOf(parentId))

  for (let child of schema.childrenOf(parentId)) {
    const matched = commonStartBetween(unmatchedWords, child.name)
    if (!matched.length) {
      continue
    }

    const { remainingWords, path } = interpret(
      unmatchedWords.slice(matched.length),
      child.id,
      schema,
    )

    return {
      remainingWords,
      path: [
        {
          node: child.id,
          matched,
        },
        ...path,
      ],
    }
  }

  return { remainingWords: unmatchedWords, path: [] }
}

function addNewNode(words: string[], path: Interpretation, schema: Schema) {
  if (!words.length) {
    return []
  }

  return [schema.addNode(words, path.at(-1)?.node)]
}

function splitNodes(path: Interpretation, schema: Schema) {
  return path.flatMap(({ node, matched }) => {
    if (matched.length === schema.nameOf(node).length) {
      return []
    }

    return [schema.splitNode(node, matched.length), node]
  })
}

function extractProperties(changedIds: UUID[], schema: Schema) {
  changedIds.forEach((nodeId) => {
    const parent = schema.parentOf(nodeId)
    if (!parent) {
      return
    }
    const grandparent = schema.parentOf(parent.id)
    if (!grandparent) {
      return
    }

    const nodeName = schema.nameOf(nodeId)
    const matchingCousins = grandparent.children
      .flatMap((auntId) =>
        auntId === parent.id ? [] : schema.childrenOf(auntId),
      )
      .filter(
        (cousin) => commonStartBetween(cousin.name, nodeName).length !== 0,
      )

    if (!matchingCousins.length) {
      return
    }

    matchingCousins.forEach((cousin) => {
      const currentName = schema.nameOf(nodeId)
      const match = commonStartBetween(cousin.name, currentName)
      const remainingCousin =
        match.length < cousin.name.length && cousin.name.slice(match.length)
      const remainingName = match.length < currentName.length

      if (remainingName) {
        const newNodeId = schema.splitNode(nodeId, match.length)
      }

      if (remainingCousin) {
        const newNodeId = schema.addNode(remainingCousin, nodeId)
      }

      schema.removeNode(cousin.id)
    })
    const node = schema.removeNode(nodeId)

    schema.addProperty(node, grandparent.id)
  })
}

export function addToSchema(title: string, schema: Schema) {
  const words = title.split(" ")
  const { remainingWords, path } = interpret(words, schema.rootId, schema)
  const splitIds = splitNodes(path, schema)
  const addedIds = addNewNode(remainingWords, path, schema)
  const changedIds = [...addedIds, ...splitIds]
  extractProperties(changedIds, schema)
  return schema
}

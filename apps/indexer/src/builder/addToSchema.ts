import { randomUUID, type UUID } from "node:crypto"
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

type Span = {
  nodeId?: UUID
  words: string[]
}
type Match = {
  spans: Required<Span>[]
  remainingWords: string[]
}

function matchNode(words: string[], node: Node, schema: Schema): Match {
  const matched = commonStartBetween(words, node.name)
  if (!matched.length) {
    return {
      spans: [],
      remainingWords: words,
    }
  }

  const childMatch = matchNodes(
    words.slice(matched.length),
    schema.childrenOf(node.id),
    schema,
  )

  return {
    spans: [
      {
        nodeId: node.id,
        words: matched,
      },
      ...childMatch.spans,
    ],
    remainingWords: childMatch.remainingWords,
  }
}

function matchNodes(words: string[], nodes: Node[], schema: Schema): Match {
  if (!words.length) {
    return {
      spans: [],
      remainingWords: words,
    }
  }

  for (let node of nodes) {
    const match = matchNode(words, node, schema)
    if (match.spans.length) {
      return match
    }
  }

  return {
    spans: [],
    remainingWords: words,
  }
}

function interpret(
  words: string[],
  schema: Schema,
): Span[] {
  let remainingWords = words
  let stack = [
    schema.categories(),
    ...schema.commonProperties().map(p => [p]),
  ]
  let spans: Span[] = []

  whileLoop: while (remainingWords.length) {
    for (let nodes of stack) {
      for (let [propertyIndex, property] of nodes.entries()) {
        const match = matchNode(remainingWords, property, schema)

        if (match.spans.length) {
          stack = stack.toSpliced(
            propertyIndex,
            1,
            ...schema.propertiesOf(property.id).map(p => [p]),
          )
          spans = spans.concat(match.spans)
          remainingWords = match.remainingWords

          continue whileLoop
        }
      }
    }

    const unmatchedWord = remainingWords.slice(0, 1)
    const lastSpan = spans.at(-1)
    remainingWords = remainingWords.slice(1)
    spans =
      !lastSpan || lastSpan.nodeId
        ? [...spans, { words: unmatchedWord }]
        : [
            ...spans.slice(0, -1),
            {
              words: [...lastSpan.words, ...unmatchedWord],
            },
          ]
  }

  return spans
}

function addNewNode(spans: Span[], schema: Schema) {
  return spans
    .map(({ nodeId, words }, index) => {
      if (nodeId) {
        return
      }

      const newNode = {
        id: randomUUID(),
        name: words,
        children: [],
        properties: [],
      }
      const addAsProperty = index === 0 && spans.length > 1
      const parent = spans.at(addAsProperty ? index+1 : index-1)?.nodeId
      schema.addNode(newNode, parent, addAsProperty)

      return newNode.id
    })
    .filter((id) => !!id)
}

function splitNodes(spans: Span[], schema: Schema) {
  return spans.flatMap(({ nodeId, words }) => {
    if (!nodeId || words.length === schema.nameOf(nodeId).length) {
      return []
    }

    return [schema.splitNode(nodeId, words.length), nodeId]
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
        schema.splitNode(nodeId, match.length)
      }

      if (remainingCousin) {
        const node = {
          id: randomUUID(),
          name: remainingCousin,
          children: [],
          properties: [],
        }
        schema.addNode(node, nodeId)
      }

      schema.removeNode(cousin.id)
    })

    const node = schema.removeNode(nodeId)
    schema.addNode(node, grandparent.id, true)
  })
}

export function addToSchema(title: string, schema: Schema) {
  const words = title.split(" ")
  const spans = interpret(words, schema)
  const splitIds = splitNodes(spans, schema)
  const addedIds = addNewNode(spans, schema)
  const changedIds = [...addedIds, ...splitIds]
  extractProperties(changedIds, schema)
  return schema
}

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

type Interpretation = { node: UUID; matched: string[] }[]

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
  const unmatchedWords = removeProperties(
    words,
    schema.propertiesOf(parentId),
  )

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
    return path
  }
  
  return [
    ...path,
    {
      node: schema.addNode(words, path.at(-1)?.node),
      matched: words
    },
  ]
}

function splitNodes(path: Interpretation, schema: Schema) {
  path.forEach(({ node, matched }) => {
    if (matched.length === schema.nameOf(node).length) {
      return
    }

    schema.splitNode(node, matched.length)
  })

  return path
}

// function extractProperties(path: Interpretation, parentId: string, interpreter: Schema) {
//   if (!path.length) {
//     return
//   }

//   const { node: nodeId } = path[0]

//   extractProperties(path.slice(1), nodeId, interpreter)

//   const node = schema[nodeId]
//   const parent = schema[parentId] 

//   const childMatches = node.children.reduce(
//     (cM, childId) => ({
//       ...cM,
//       [childId]: parent.children.some((siblingId) => {
//         if (siblingId === nodeId) {
//           return false
//         }

//         const sibling = schema[siblingId]
//         const nieceMatches = sibling.children.reduce((nM, nieceId) => ({
//           ...nM,
//           [nieceId]: !!commonStartBetween(schema[childId].name, schema[nieceId].name).length
//         }), {} as Record<string, boolean>)

//         schema[siblingId] = {
//           ...sibling,
//           children: sibling.children.filter(nieceId => !nieceMatches[nieceId])
//         }

//         return Object.values(nieceMatches).some(match => match)
//       })
//     }),
//     {} as Record<string, boolean>,
//   )

//   schema[nodeId] = {
//     ...node,
//     children: node.children.filter(childId => !childMatches[childId]),
//   }

//   schema[parentId] = {
//     ...parent,
//     properties: [
//       ...parent.properties,
//       ...node.children.filter(childId => childMatches[childId]),
//     ]
//   }

//   return
// }

export function addToSchema(title: string, schema: Schema) {
  const words = title.split(" ")
  let { remainingWords, path } = interpret(words, schema.rootId, schema)
  path = splitNodes(path, schema)
  path = addNewNode(remainingWords, path, schema)
  // extractProperties(path, interpreter.rootId, interpreter)
  return schema
}

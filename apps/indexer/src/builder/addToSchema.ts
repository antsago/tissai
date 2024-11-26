import { randomUUID } from "node:crypto"

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

export type SchemaNode = {
  id: string
  name: string[]
  children: string[]
  properties: string[]
}

type Schema = Record<string, SchemaNode>
type Interpretation = { node: string; matched: string[] }[]

function removeProperties(words: string[], properties: SchemaNode[]) {
  return words.filter((word) =>
    properties.every((property) => property.name[0] !== word),
  )
}

function interpret(
  words: string[],
  parentId: string,
  schema: Schema,
): { remainingWords: string[]; path: Interpretation } {
  const unmatchedWords = removeProperties(
    words,
    schema[parentId].properties.map((id) => schema[id]),
  )

  for (let childId of schema[parentId].children) {
    const matched = commonStartBetween(unmatchedWords, schema[childId].name)
    if (!matched.length) {
      continue
    }

    const { remainingWords, path } = interpret(
      unmatchedWords.slice(matched.length),
      childId,
      schema,
    )

    return {
      remainingWords,
      path: [
        {
          node: childId,
          matched,
        },
        ...path,
      ],
    }
  }

  return { remainingWords: unmatchedWords, path: [] }
}

function addNewNode(words: string[], path: Interpretation, schema: Schema, rootId: string) {
  if (!words.length) {
    return schema
  }

  const newNode = {
    id: randomUUID(),
    name: words,
    children: [],
    properties: [],
  }
  const parent = path.at(-1)?.node ?? rootId
  schema[parent].children = [...schema[parent].children, newNode.id]

  return {
    ...schema,
    [newNode.id]: newNode,
  }
}

function splitNodes(path: Interpretation, schema: Schema) {
  if (!path.length) {
    return schema
  }

  return path.reduce((updatedSchema, { node, matched }) => {
    if (matched.length === updatedSchema[node].name.length) {
      return updatedSchema
    }

    const newChild = {
      id: randomUUID(),
      name: updatedSchema[node].name.slice(matched.length),
      properties: updatedSchema[node].properties,
      children: updatedSchema[node].children,
    }
    const newNode = {
      id: updatedSchema[node].id,
      name: matched,
      children: [newChild.id],
      properties: [],
    }

    return {
      ...updatedSchema,
      [newNode.id]: newNode,
      [newChild.id]: newChild,
    }
  }, schema)
}

function extractProperties(path: Interpretation, parentId: string, initial: Schema): Schema {
  if (!path.length) {
    return initial
  }

  const { node: nodeId } = path[0]

  let schema = extractProperties(path.slice(1), nodeId, initial)

  const node = schema[nodeId]
  const parent = schema[parentId] 

  const childMatches = node.children.reduce(
    (cM, childId) => ({
      ...cM,
      [childId]: parent.children.some((siblingId) => {
        if (siblingId === nodeId) {
          return false
        }

        const sibling = schema[siblingId]
        const nieceMatches = sibling.children.reduce((nM, nieceId) => ({
          ...nM,
          [nieceId]: !!commonStartBetween(schema[childId].name, schema[nieceId].name).length
        }), {} as Record<string, boolean>)

        schema[siblingId] = {
          ...sibling,
          children: sibling.children.filter(nieceId => !nieceMatches[nieceId])
        }

        return Object.values(nieceMatches).some(match => match)
      })
    }),
    {} as Record<string, boolean>,
  )

  schema[nodeId] = {
    ...node,
    children: node.children.filter(childId => !childMatches[childId]),
  }

  schema[parentId] = {
    ...parent,
    properties: [
      ...parent.properties,
      ...node.children.filter(childId => childMatches[childId]),
    ]
  }

  return schema
}

function nodesToSchema(nodes: Node[], initial: Schema) {
  return nodes.reduce(
    ({ schema, ids }, node) => {
      const { schema: withNode, id: nodeId } = nodeToSchema(node, schema)
      return {
        schema: withNode,
        ids: [...ids, nodeId],
      }
    },
    { schema: initial, ids: [] as string[] },
  )
}

function nodeToSchema(
  node: Node,
  initial: Schema = {},
): { schema: Schema; id: string } {
  const { schema: withChildren, ids: childIds } = nodesToSchema(
    node.children,
    initial,
  )
  const { schema: withProperties, ids: propertyIds } = nodesToSchema(
    node.properties,
    withChildren,
  )

  const id = randomUUID()
  return {
    schema: {
      ...withProperties,
      [id]: {
        id,
        name: node.name,
        children: childIds,
        properties: propertyIds,
      },
    },
    id,
  }
}

function schemaToNode(schema: Schema, nodeId: string): Node {
  const node = schema[nodeId]

  return {
    name: node.name,
    children: node.children.map(id => schemaToNode(schema, id)),
    properties: node.properties.map(id => schemaToNode(schema, id)),
  }
}

export function addToSchema(title: string, rootNode: Node) {
  const words = title.split(" ")
  const { schema, id: rootId } = nodeToSchema(rootNode)
  const { remainingWords, path } = interpret(words, rootId, schema)
  let updatedSchema = schema
  updatedSchema = splitNodes(path, schema)
  updatedSchema = addNewNode(remainingWords, path, updatedSchema, rootId)
  updatedSchema = extractProperties(path, rootId, updatedSchema)
  return schemaToNode(updatedSchema, rootId)
}

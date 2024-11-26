import { randomUUID, type UUID } from "node:crypto"

export type TreeNode = {
  name: string[]
  children: TreeNode[]
  properties: TreeNode[]
}
export type Node = {
  id: UUID
  name: string[]
  children: UUID[]
  properties: UUID[]
}
export type Schema = Record<UUID, Node>

function nodesToSchema(nodes: TreeNode[], initial: Schema) {
  return nodes.reduce(
    ({ schema, ids }, node) => {
      const { schema: withNode, id: nodeId } = nodeToSchema(node, schema)
      return {
        schema: withNode,
        ids: [...ids, nodeId],
      }
    },
    { schema: initial, ids: [] as UUID[] },
  )
}

function nodeToSchema(
  node: TreeNode,
  initial: Schema = {},
): { schema: Schema; id: UUID } {
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

function schemaToNode(schema: Schema, nodeId: UUID): TreeNode {
  const node = schema[nodeId]

  return {
    name: node.name,
    children: node.children.map(id => schemaToNode(schema, id)),
    properties: node.properties.map(id => schemaToNode(schema, id)),
  }
}

export function Interpreter(tree: TreeNode) {
  const { schema, id: rootId} = nodeToSchema(tree)

  const addNode = (name: string[], parent: UUID = rootId) => {
    const node = {
      id: randomUUID(),
      name,
      children: [],
      properties: [],
    }

    schema[node.id] = node
    schema[parent].children = [...schema[parent].children, node.id]

    return node.id
  }

  const splitNode = (id: UUID, atIndex: number) => {
    const node = schema[id]

    const newChild = {
      id: randomUUID(),
      name: node.name.slice(atIndex),
      properties: node.properties,
      children: node.children,
    }
    const updatedNode = {
      id: node.id,
      name: node.name.slice(0, atIndex),
      children: [newChild.id],
      properties: [],
    }

    schema[newChild.id] = newChild
    schema[node.id] = updatedNode

    return newChild.id
  }

  return {
    rootId,
    asTree: () => schemaToNode(schema, rootId),
    propertiesOf: (id: UUID) => schema[id].properties.map(pId => schema[pId]),
    childrenOf: (id: UUID) => schema[id].children.map(cId => schema[cId]),
    nameOf: (id: UUID) => schema[id].name,
    addNode,
    splitNode,
  }
}
export type Interpreter = ReturnType<typeof Interpreter>

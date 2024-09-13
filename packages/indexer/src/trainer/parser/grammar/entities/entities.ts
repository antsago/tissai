import { EntityStart, EntityEnd, Id } from "../../lexer/index.js"
import { and, any, or, restructure } from "../../operators/index.js"
import { Any, IsData, IsSymbol } from "./values.js"
import { Type, type Schema } from "./types.js"
import { Properties } from "./Properties.js"

export type GenericEntity = {
  [Id]: string
  [Type]: symbol
} & Record<string, any[]>

export const Entity = (schema: Schema) =>
  restructure(
    and(
      IsSymbol(EntityStart),
      IsData(),
      Properties(schema),
      IsSymbol(EntityEnd),
    ),
    ([s, id, parsedProperties, e]) =>
      ({
        [Id]: id,
        [Type]: schema[Type],
        ...parsedProperties,
      }) as GenericEntity,
  )

export const Ontology = (schemas: Schema[]) =>
  restructure(any(or(...schemas.map(Entity), Any)), (candidates) =>
    candidates.filter((c) => typeof c === "object"),
  )

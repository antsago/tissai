import { EntityStart, EntityEnd, Id } from "../../../lexer/index.js"
import { and, any, or, restructure } from "../../operators/index.js"
import { Any, IsData, IsSymbol } from "./values.js"
import { type Schema } from "./types.js"
import { Properties } from "./Properties.js"

export const Entity = (schema: Schema) =>
  restructure(
    and(
      IsSymbol(EntityStart),
      IsData(),
      Properties(schema),
      IsSymbol(EntityEnd),
    ),
    ([s, id, parsedProperties, e]) => ({
      ...parsedProperties,
      [Id]: id,
    }),
  )

export const Ontology = (schemas: Schema[]) =>
  restructure(any(or(...schemas.map(Entity), Any)), (candidates) =>
    candidates.filter((c) => typeof c === "object"),
  )

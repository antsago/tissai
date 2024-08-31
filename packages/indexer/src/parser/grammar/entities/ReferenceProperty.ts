import { and, restructure } from "../../operators/index.js"
import { Id } from "../../../lexer/index.js"
import type { ReferenceDefinition } from "./types.js"
import { IsData, IsSymbol } from "./values.js"
import { Property } from "./Property.js"

export const ReferenceProperty = ({ key, name }: ReferenceDefinition) =>
  restructure(Property(and(IsSymbol(Id), IsData()), name), (references) => ({
    key,
    value: references.map((r) => ({ [Id]: r })),
  }))

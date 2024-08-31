import type {
  PropertyDefinition,
} from "./types.js"
import { DataProperty } from "./DataProperty.js"
import { ReferenceProperty } from "./ReferenceProperty.js"
import { ParsedProperty } from "./ParsedProperty.js"

export const DefinedProperty = (definition: PropertyDefinition) =>
  "parse" in definition
    ? ParsedProperty(definition)
    : "isReference" in definition
      ? ReferenceProperty(definition)
      : DataProperty(definition)

import { restructure } from "../../operators/index.js"
import type { DataDefinition } from "./types.js"
import { IsData } from "./values.js"
import { Property } from "./Property.js"

export const DataProperty = ({ key, name, value }: DataDefinition) =>
  restructure(Property(IsData(value), name), (dataValues) => ({
    key,
    value: dataValues,
  }))

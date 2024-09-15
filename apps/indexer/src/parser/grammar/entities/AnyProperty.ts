import { any, restructure } from "../../operators/index.js"
import { IsValue } from "./values.js"
import { Property } from "./Property.js"

export const AnyProperty = restructure(Property(any(IsValue)), (value) => ({
  key: undefined,
  value,
}))

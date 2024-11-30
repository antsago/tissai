import _ from "lodash"
import { addToSchema } from "./addToSchema.js"
import { type TreeNode, Schema } from "./nodesToSchema.js"
import titles from "../titles.js"

const normalizeString = (str: string) =>
  str
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()

const initialSchema = {
  name: [],
  properties: [],
  children: [],
} as TreeNode

const finalSchema = _.shuffle(titles)
  .map((title) => normalizeString(title))
  .reduce((schema, title) => addToSchema(title, schema), Schema(initialSchema))

console.log(JSON.stringify(finalSchema.asTree(), null, 2))

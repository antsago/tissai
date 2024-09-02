import { type Schema, Attributes, Required, Lexer, TokenReader } from "../parser/index.js"
import * as model from "./model.js"
import { getLabels } from "./getLabels.js"

export const getSchemas = (lexer: Lexer): Schema[] => [
  {
    [Required]: {
      key: "@type",
      value: "Product",
    },
    title: {
      name: "name",
      parse: {
        as: "attributes",
        with: async (title: string) => {
          const tokens = await lexer.fromText(title, getLabels(model))
          return Attributes(TokenReader(tokens))
        },
      },
    },
    brand: {
      name: "brand",
      isReference: true,
    },
    description: "description",
    images: "image",
  },
  {
    [Required]: {
      key: "@type",
      value: "Brand",
    },
    name: "name",
    icon: "image",
  },
]

import { type Token as LexerToken, Lexer } from "../lexer/index.js"
import { TokenReader } from "./TokenReader.js"
import * as model from "./model.js"
import { type Schema, Attributes, Required } from "./grammar/index.js"
import { LabelMap } from "./types.js"

const getLabels = (map: LabelMap) => (tokens: LexerToken[]) =>
  tokens.map((t) => (t.text in map ? Object.keys(map[t.text]) : ["unknown"]))

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
          const tokens = await lexer.fromText(title, getLabels(model.vocabulary))
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

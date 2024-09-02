import { PythonPool } from "@tissai/python-pool"
import { Required, Lexer } from "../parser/index.js"
import { type Label, getLabels } from "./labelTokens.js"

export const getSchemas = (python: PythonPool<{ title: string; words: string[] }, Label[]>) => (lexer: Lexer) => [
  {
    [Required]: {
      key: "@type",
      value: "Product",
    },
    title: {
      name: "name",
      parse: {
        as: "parsedTitle",
        with: (title: string) =>
          lexer.fromText(title, getLabels(title, python)),
      },
    },
  },
] 

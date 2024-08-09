import parseTokens from "./parserAnalyser.js"

const tokens = [
  { label: "categoria", text: "pantalones" },
  { label: "deporte", text: "esquí" },
  { label: "filler", text: "y" },
  { label: "deporte", text: "nieve" },
  { label: "filler", text: "con" },
  { label: "cremallera", text: "cremallera" },
]

const statements = parseTokens(tokens)

console.dir(statements, { depth: null })

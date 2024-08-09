import parseTokens from './parserAnalyser.js'

const tokens = [
  { type: 'categoria', value: 'pantalones' },
  { type: 'deporte', value: 'esquí' },
  { type: 'filler', value: 'y' },
  { type: 'deporte', value: 'nieve' },
  { type: 'filler', value: 'con' },
  { type: 'cremallera', value: 'cremallera' },
]

const statements = parseTokens(tokens);

console.dir(statements, { depth: null });
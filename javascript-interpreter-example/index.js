// Code which we want to parse
// const code = `i = 5;`;

// Run the lexer
const tokens = [
  { type: 'categoria', value: 'pantalones' },
  { type: 'deporte', value: 'esquí' },
  { type: 'filler', value: 'y' },
  { type: 'deporte', value: 'nieve' },
  { type: 'filler', value: 'con' },
  { type: 'cremallera', value: 'cremallera' },
]

// Import the parser
const parseTokens = require('./parser-analyser');

// Run the parser
const statements = parseTokens(tokens);

// Finally we output the statements we parsed.
console.dir(statements, { depth: null });
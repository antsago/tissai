import TokenReader from './token-reader.js'
import parseGrammar from './grammar.js'

const parseTokens = tokens => {
    const reader = new TokenReader(tokens);

    const statements = [];

    while (reader.hasNext()) {
        const statement = parseGrammar(reader);

        if (statement) {
            statements.push(statement);
            continue;
        }

        let token = reader.hasNext() ? reader.get() : reader.getLastToken();
        throw new Error(`Syntax error on ${token.line}:${token.character} for "${token.value}". Expected an assignment, function call or an if statement.`);
    }

    return statements;
};

export default parseTokens

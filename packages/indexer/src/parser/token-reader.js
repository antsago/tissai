class TokenReader {
    constructor(tokens) {
        this.tokens = tokens;
        this.position = 0;
        this.stateStack = [];
    }

    pushState() {
        this.stateStack.push(this.position);
    }

    restoreState() {
        this.position = this.popState();
    }

    popState() {
        return this.stateStack.pop();
    }

    isType(type) {
        return this.hasNext() && this.getType() === type;
    }

    getType() {
        return this.get().type;
    }

    getValue() {
        return this.get()?.value;
    }

    isValue(value) {
        return this.getValue() === value;
    }

    get() {
        return this.tokens[this.position];
    }

    getLastToken() {
        return this.tokens[this.tokens.length - 1];
    }

    next() {
        this.position++;
    }

    hasNext() {
        return this.position < this.tokens.length;
    }
}

module.exports = TokenReader;
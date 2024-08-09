const minOf = (minAmount, check) => reader => {
    reader.pushState();

    const results = [];

    while (true) {
        const result = check(reader);

        if (!result) {
            if (results.length < minAmount) {
                reader.restoreState();
                return null;
            }

            break;
        }

        results.push(result);
    }

    reader.popState();
    return results;
};

const token = (type, value = null) => reader => {
    let valueMatches = value ? reader.isValue(value) : true;

    if (reader.isType(type) && valueMatches) {
        const result = reader.get();

        reader.next();

        return result;
    };

    return null;
};

module.exports = {
    minOf,
    token,
};
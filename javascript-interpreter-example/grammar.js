const { rule, either, exactly, optional, minOf, token } = require('./rule-helpers');

// ProductPart -> Attribute | Filler
const ProductPart = rule(
    () => either(Attribute, Filler),
    part => part
);

// Attribute -> Label WithFiller*
const Attribute = rule(
    () => exactly(Label, minOf(0, WithFiller)),
    ([label, filler]) => ({ type: 'attribute', tokens: [label, ...filler.flat()] })
)

// WithFiller -> Filler* Label
const WithFiller = rule(
    () => exactly(minOf(0, Filler), Label),
    (tokens) => tokens.flat()
)

const Filler = token('filler', 'con')
const Label = rule(
    () => either(token('categoria', 'pantalones'), token('cremallera', 'cremallera')),
    (token) => token
)

module.exports = ProductPart;
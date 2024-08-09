const { rule, either, exactly, optional, minOf, token } = require('./rule-helpers');

// ProductPart -> Attribute | Filler
const ProductPart = rule(
    () => either(Attribute, Filler),
    part => part
);

const Attribute = rule(
    () => either(AttributeCat, AttributeCrem),
    (attribute) => attribute
)

// Attribute -> Label WithFiller*
const AttributeCrem = rule(
    () => exactly(Cremallera, minOf(0, WithFillerCrem)),
    ([label, filler]) => ({ type: 'attribute', label: 'cremallera', tokens: [label, ...filler.flat()] })
)

// WithFiller -> Filler* Label
const WithFillerCrem = rule(
    () => exactly(minOf(0, Filler), Cremallera),
    (tokens) => tokens.flat()
)

// Attribute -> Label WithFiller*
const AttributeCat = rule(
    () => exactly(Categoria, minOf(0, WithFillerCat)),
    ([label, filler]) => ({ type: 'attribute', label: 'categoria', value: [label, ...filler.flat()] })
)

// WithFiller -> Filler* Label
const WithFillerCat = rule(
    () => exactly(minOf(0, Filler), Categoria),
    (tokens) => tokens.flat()
)

const Label = rule(
    () => either(Categoria, Cremallera),
    (token) => token
)

const Filler = token('filler', 'con')
const Categoria = token('categoria', 'pantalones')
const Cremallera = token('cremallera', 'cremallera')

module.exports = ProductPart;
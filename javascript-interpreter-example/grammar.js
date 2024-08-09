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

// Attribute -> Label (Filler* Label)*
const AttributeCrem = rule(
    () => exactly(Cremallera, minOf(0, exactly(minOf(0, Filler), Cremallera))),
    ([label, filler]) => ({ type: 'attribute', label: 'cremallera', tokens: [label, ...filler.flat(Infinity)] })
)

// Attribute -> Label (Filler* Label)*
const AttributeCat = rule(
    () => exactly(Categoria, minOf(0, exactly(minOf(0, Filler), Categoria))),
    ([label, filler]) => ({ type: 'attribute', label: 'categoria', value: [label, ...filler.flat(Infinity)] })
)

const Filler = token('filler', 'con')
const Categoria = token('categoria', 'pantalones')
const Cremallera = token('cremallera', 'cremallera')

module.exports = ProductPart;
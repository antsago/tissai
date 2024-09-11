import {
  type Schema,
  Attributes,
  Required,
  Lexer,
  TokenReader,
  Type,
  Compiler,
} from "../parser/index.js"
import model from "./model.js"
import { getLabels } from "./getLabels.js"

export const ProductType = Symbol("Product")
export const BrandType = Symbol("Brand")
export const OfferType = Symbol("Offer")
export const SellerType = Symbol("Seller")

const ProductSchema = (lexer: Lexer): Schema => ({
  [Type]: ProductType,
  [Required]: {
    key: "@type",
    value: "Product",
  },
  title: {
    name: "name",
    parse: {
      as: "attributes",
      with: async (title: string) => {
        const tokens = await lexer.fromText(title, getLabels(model))
        return Attributes(TokenReader(tokens))
      },
    },
  },
  brand: {
    name: "brand",
    isReference: true,
  },
  description: "description",
  images: "image",
  offers: {
    name: "offers",
    isReference: true,
  },
})

const BrandSchema: Schema = {
  [Type]: BrandType,
  [Required]: {
    key: "@type",
    value: "Brand",
  },
  name: "name",
  logo: "image",
}
const OfferSchema: Schema = {
  [Type]: OfferType,
  [Required]: {
    key: "@type",
    value: "Offer",
  },
  seller: {
    name: "seller",
    isReference: true,
  },
  price: "price",
  currency: "priceCurrency",
}
const OrganizationSchema: Schema = {
  [Type]: SellerType,
  [Required]: {
    key: "@type",
    value: "Organization",
  },
  name: "name",
}

const getSchemas = (lexer: Lexer): Schema[] => [
  ProductSchema(lexer),
  BrandSchema,
  OfferSchema,
  OrganizationSchema,
]

export const compilerFixture = () => {
  const compiler = Compiler(getSchemas)
  return [compiler, () => compiler.close()] as const
}
import { any, or } from "../operators/index.js"
import Filler from "./Filler.js"
import Attribute from "./Attribute.js"

const Product = any(or(Attribute, Filler))

export default Product

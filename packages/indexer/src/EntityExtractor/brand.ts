import type { Brand } from "@tissai/db"
import type { ParsedLd } from "./title.js"

function brand({ brandName, brandLogo }: ParsedLd): Brand | undefined {
  if (!brandName) {
    return undefined
  }

  return { name: brandName.toLowerCase(), logo: brandLogo }
}
export default brand

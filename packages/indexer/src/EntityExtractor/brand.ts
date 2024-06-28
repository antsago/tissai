import type { Brand } from "@tissai/db"
import type { JsonLD } from "../jsonLd.js"

function brand({ brandName, brandLogo }: JsonLD): Brand | undefined {
  if (!brandName) {
    return undefined
  }

  return { name: brandName.toLowerCase(), logo: brandLogo }
}
export default brand

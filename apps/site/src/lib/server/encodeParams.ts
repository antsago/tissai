import type { UrlParams } from "./decodeParams"

export const encodeParams = (params: UrlParams) => {
  const encoded = new URLSearchParams()

  encoded.append("q", params.query)
  if (params.brand) {
    encoded.append("brand", params.brand)
  }
  if (params.max) {
    encoded.append("max", String(params.max))
  }
  if (params.min) {
    encoded.append("min", String(params.min))
  }
  if (params.category) {
    encoded.append("cat", params.category)
  }
  params.attributes?.forEach((attribute) => encoded.append("att", attribute))

  return encoded.toString()
}

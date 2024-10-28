import type { UrlParams } from "./decodeParams"

export const encodeParams = (params: UrlParams) => {
  const encoded = new URLSearchParams()

  encoded.append("q", params.query)
  encoded.append("cat", params.category!)

  if(params.attributes) {
    encoded.append("att", params.attributes[0])
  }

  return encoded.toString()
}

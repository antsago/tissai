import he from "he"

export type JsonLD = Partial<{
  title: string
  description: string
  image: string[]
  brandName: string
  brandLogo: string
  offers: Partial<{
    price?: number
    currency?: string
    seller?: string
  }>[]
}>

function expandEntry(linkedData: any): any {
  if (typeof linkedData !== "object") {
    return linkedData
  }

  if (Array.isArray(linkedData)) {
    return linkedData.map((v) => expandEntry(v))
  }

  const properties = Object.entries(linkedData)
    .filter(([key, value]) => value !== null)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return [
          key,
          value
            .filter((v) => v !== null)
            .map((v) => expandEntry(v))
            .flat(),
        ]
      }

      if (typeof value === "object") {
        return [key, [expandEntry(value)]]
      }

      if (typeof value === "string") {
        // Escapes from self-storage + original escapes
        return [key, [he.decode(he.decode(value))]]
      }

      return [key, [value]]
    })
  return Object.fromEntries(properties)
}

export function parseAndExpand(entries: string[]) {
  return entries
    .map((t) => JSON.parse(t))
    .map(expandEntry)
    .map((t) => (t["@graph"] ? t["@graph"] : t))
    .flat()
}

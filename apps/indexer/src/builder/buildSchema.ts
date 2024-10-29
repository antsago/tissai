export function buildSchema(titles: string[]) {
  return titles.map(title => ({
    name: title,
    properties: [],
    subcategories: [],
  }))
}
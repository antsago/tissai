export type Attribute = {
  id: string
  value: string
  product: string
}
export type Brand = {
  name: string
  logo?: string
}
export type Offer = {
  id: string
  url: string
  site: string
  product: string
  seller?: string
  price?: number
  currency?: string
}
export type Page = {
  id: string
  url: string
  body: string
  site: string
}
export type Product = {
  id: string
  title: string
  description?: string
  images?: string[]
  brand?: string
  category?: string
}
export type Node = {
  id: string
  parent: string | null
  name: string
  tally: number
}
export type Seller = {
  name: string
}
export type Site = {
  id: string
  name: string
  icon: string
  domain: string
  sitemaps?: string[]
  sitemapWhitelist?: string[]
  urlKeywords?: string[]
}

export type Database = {
  attributes: Attribute
  brands: Brand
  nodes: Node
  offers: Offer
  pages: Page
  products: Product
  sellers: Seller
  sites: Site
}

export type TableNames = keyof Database
export type Entities = Database[TableNames]

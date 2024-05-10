const { randomUUID } = require("node:crypto")
const { readdir, readFile } = require("fs/promises")
const { Pool, escapeLiteral } = require("pg")
// const products = require("../../data/withEmbeddings.json")
const { Content } = require("./Crawler/parsers")
// const shops = require("./shops")

function escape(literal) {
  if (literal === null || literal === undefined) {
    return "null"
  }

  return escapeLiteral(literal)
}

async function loadProducts() {
  const pool = new Pool({
    connectionString: process.env.PG_CONNECTION_STRING,
  })

  await pool.query("CREATE EXTENSION IF NOT EXISTS vector;")
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id            uuid PRIMARY KEY,
      name          text,
      description   text,
      images        text[],
      brand         text,
      product_uri   text,
      shop_name     text,
      shop_icon     text,
      embedding     vector(384)
    );`)
  console.log("Table created")

  const values = products.map((product) => {
    const images = Array.isArray(product.image)
      ? product.image
      : [product.image]
    return `(
      ${escape(product.id)},
      ${escape(product.name)},
      ${escape(product.description)},
      '{"${images.join('","')}"}',
      ${escape(product.brand)},
      ${escape(product.sellers?.[0]?.productUrl)},
      ${escape(product.sellers?.[0]?.shop.name)},
      ${escape(product.sellers?.[0]?.shop.image)},
      '[${product.embedding.join(",")}]'
    )`
  })

  const query = `
  INSERT INTO products
  (id, name, description, images, brand, product_uri, shop_name, shop_icon, embedding)
  VALUES ${values.join(",")};
  `
  const res = await pool.query(query)

  console.log(`Inserted ${res.rowCount} products`)

  await pool.end()
}

async function loadPageFromSite(site, path, pool) {
  const file = await readFile(`../data/${site.domain}/${path}`, {
    encoding: "utf8",
  })
  const request = JSON.parse(file)
  const content = Content(request.url, request.body)
  
  if (
    !content?.jsonLD?.product &&
    content?.openGraph?.type !== "product"
  ) { return }
  
  const query = `
    INSERT INTO pages (id, url, body, site)
    VALUES (
      ${escape(randomUUID())},
      ${escape(request.url)},
      ${escape(request.body)},
      ${escape(site.id)}
    );
  `
  await pool.query(query)
}
async function loadPagesFromSite(site, pool) {
  const paths = await readdir(`../data/${site.domain}`)

  await paths.reduce(async (previousPath, path) => {
    await previousPath

    await loadPageFromSite(site, path, pool)
  }, Promise.resolve())
}
async function loadPages() {
  const pool = new Pool({
    connectionString: 'postgres://postgres:postgres@postgres:5432/uranus',
  })
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pages (
      id                    uuid PRIMARY KEY,
      url                   text UNIQUE NOT NULL,
      body                  text NOT NULL,
      site                  uuid REFERENCES sites
    );`)
  console.log("Table created")

  const sites = (await pool.query(`SELECT id, domain FROM sites ORDER BY domain LIMIT 1 OFFSET 8;`)).rows

  await sites.reduce(async (previousSite, site) => {
    await previousSite
    await loadPagesFromSite(site, pool)
    console.log(`Inserted pages for ${site.domain}`)
  }, Promise.resolve())

  await pool.end()
}

async function loadSites() {
  const initialPool = new Pool({
    connectionString: process.env.PG_CONNECTION_STRING,
  })
  await initialPool.query(`CREATE DATABASE uranus;`)
  console.log("Created uranus db")
  await initialPool.end()
  
  const pool = new Pool({
    connectionString: 'postgres://postgres:postgres@postgres:5432/uranus',
  })
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sites (
      id                    uuid PRIMARY KEY,
      name                  text NOT NULL,
      icon                  text NOT NULL,
      domain                text UNIQUE NOT NULL,
      sitemaps              text[],
      sitemapWhitelist      text[],
      urlKeywords           text[]
    );`)
  console.log("Table created")

  const values = shops.map((shop) => {
    return `(
      ${escape(randomUUID())},
      ${escape(shop.name)},
      ${escape(shop.icon)},
      ${escape(shop.domain)},
      ${shop.sitemaps ? `'{"${shop.sitemaps.join('","')}"}'` : 'NULL'},
      ${shop.sitemapWhitelist ? `'{"${shop.sitemapWhitelist.join('","')}"}'` : 'NULL'},
      ${shop.urlKeywords ? `'{"${shop.urlKeywords.join('","')}"}'` : 'NULL'}
    )`
  })

  const query = `
  INSERT INTO sites
  (id, name, icon, domain, sitemaps, sitemapWhitelist, urlKeywords)
  VALUES ${values.join(",")};
  `
  const res = await pool.query(query)

  console.log(`Inserted ${res.rowCount} sites`)

  await pool.end()
}

// loadProducts()
// loadSites()
loadPages()

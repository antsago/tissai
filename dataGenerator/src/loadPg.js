const { Pool, escapeLiteral } = require('pg')
const products = require('../../data/products.json')

function escape(literal) {
  if(literal === null || literal === undefined) {
    return "null"
  }

  return escapeLiteral(literal)
}

async function main() {
  const pool = new Pool({
    host: 'postgres',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres',
  })
   
  // CREATE TABLE IF NOT EXISTS products (id uuid PRIMARY KEY, name text, description text, images text[], brand text, product_uri text, shop_name text, shop_icon text);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id            uuid PRIMARY KEY,
      name          text,
      description   text,
      images        text[],
      brand         text,
      product_uri   text,
      shop_name     text,
      shop_icon     text
    );`)
  console.log('Table created')

  const values = products.map(product => {
    const images = Array.isArray(product.image) ? product.image : [product.image]
    return `(
      ${escape(product.id)},
      ${escape(product.name)},
      ${escape(product.description)},
      '{"${images.join('","')}"}',
      ${escape(product.brand)},
      ${escape(product.sellers?.[0]?.productUrl)},
      ${escape(product.sellers?.[0]?.shop.name)},
      ${escape(product.sellers?.[0]?.shop.image)}
    )`
  })

  const query = `
  INSERT INTO products
  (id, name, description, images, brand, product_uri, shop_name, shop_icon)
  VALUES ${values.join(',')};
  `
  const res = await pool.query(query)

  console.log(`Inserted ${res.rowCount} products`)

  await pool.end()
}

main()

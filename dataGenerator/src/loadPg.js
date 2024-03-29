const { Pool, escapeLiteral } = require('pg')
const products = require('../../data/withEmbeddings.json')

function escape(literal) {
  if(literal === null || literal === undefined) {
    return "null"
  }

  return escapeLiteral(literal)
}

async function main() {
  const pool = new Pool({
		connectionString: process.env.PG_CONNECTION_STRING,
  })
   
  await pool.query('CREATE EXTENSION IF NOT EXISTS vector;')
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
      ${escape(product.sellers?.[0]?.shop.image)},
      '[${product.embedding.join(",")}]'
    )`
  })

  const query = `
  INSERT INTO products
  (id, name, description, images, brand, product_uri, shop_name, shop_icon, embedding)
  VALUES ${values.join(',')};
  `
  const res = await pool.query(query)

  console.log(`Inserted ${res.rowCount} products`)

  await pool.end()
}

main()

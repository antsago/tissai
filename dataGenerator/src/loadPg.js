const { Pool } = require('pg')

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

  const res = await pool.query(
    `INSERT INTO products (
      id, name, description, images, brand, product_uri, shop_name, shop_icon
    ) VALUES (
      '5f4f389d-cc00-4bdf-a484-278e3b18975c',
      'Conjunto de jersey, pantalón y chaleco | SPF',
      'Shop the look! Complete outfits, smart prices. Jersey Estructura Lana. Pantalón Efecto Piel Slim. Chaleco Saddle.',
      '{"https://myspringfield.com/on/demandware.static/-/Sites-storefront-springfield/default/dwa93e7817/P_00550823FM.jpg"}',
      NULL,
      'https://myspringfield.com/es/es/conjunto-de-jersey-pantalon-y-chaleco/00550823.html',
      'Springfield',
      'https://myspringfield.com/on/demandware.static/Sites-SPF-Site/-/default/dw531e4368/img/favicon/favicon-96x96.png'
    );`
  )
  console.log(`Inserted ${res.rowCount} products`)

  await pool.end()
}

main()

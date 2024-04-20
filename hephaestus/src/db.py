import psycopg2
import psycopg2.extras

psycopg2.extras.register_uuid()

def getPages():
  with psycopg2.connect("postgres://postgres:postgres@postgres:5432/uranus") as conn:
    with conn.cursor() as curs:
      curs.execute("SELECT id, body FROM pages;")
      while (row := curs.fetchone()) is not None:
        yield {
          "id": row[0],
          "body": row[1],
        }

def loadProduct(product):
  with psycopg2.connect("postgres://postgres:postgres@postgres:5432/gaia") as conn:
    with conn.cursor() as curs:
      curs.execute(
      """
        INSERT INTO products
          (id, title, description, images, page)
        VALUES (%(id)s, %(title)s, %(description)s, %(images)s, %(page)s);
      """,
      product)

def createGaiaDb():
  with psycopg2.connect("postgres://postgres:postgres@postgres:5432/gaia") as conn:
    with conn.cursor() as curs:
      curs.execute("""
        CREATE TABLE IF NOT EXISTS products (
          id            uuid PRIMARY KEY,
          title         text,
          description   text,
          images        text[],
          page          uuid
        );
      """)

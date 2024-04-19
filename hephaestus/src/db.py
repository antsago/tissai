import psycopg2
import psycopg2.extras

psycopg2.extras.register_uuid()

def getPage():
  with psycopg2.connect("postgres://postgres:postgres@postgres:5432/uranus") as conn:
    with conn.cursor() as curs:
      curs.execute("SELECT id, body FROM pages;")
      response = curs.fetchone()
      return {
        "id": response[0],
        "body": response[1],
      }

def loadProduct(product):
  with psycopg2.connect("postgres://postgres:postgres@postgres:5432/gaia") as conn:
    with conn.cursor() as curs:
      curs.execute(
      """
        INSERT INTO products
          (id, title, description, images)
        VALUES (%(id)s, %(title)s, %(description)s, %(images)s);
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
          images        text[]
        );
      """)

import psycopg2

def getPage():
  with psycopg2.connect("postgres://postgres:postgres@postgres:5432/uranus") as conn:
    with conn.cursor() as curs:
      curs.execute("SELECT id, body FROM pages;")
      response = curs.fetchone()
      return {
        "id": response[0],
        "body": response[1],
      }

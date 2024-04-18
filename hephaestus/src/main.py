import psycopg2

with psycopg2.connect("postgres://postgres:postgres@postgres:5432/uranus") as conn:
  with conn.cursor() as curs:
    curs.execute("SELECT id, body FROM pages;")
    response = curs.fetchone()
    page = {
      "id": response[0],
      "body": response[1],
    }


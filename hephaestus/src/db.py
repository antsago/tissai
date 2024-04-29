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

def createGaiaDb():
  with psycopg2.connect("postgres://postgres:postgres@postgres:5432/gaia") as conn:
    with conn.cursor() as curs:
      curs.execute("""
        CREATE TABLE IF NOT EXISTS predicates (
          id                     uuid PRIMARY KEY,
          page                   uuid,
          predicate              text,
          subject_string_value   text,
          subject_rfd_type       text,
          subject_json_type      text,
          object_string_value    text,
          object_rfd_type        text,
          object_json_type       text
        );
      """)

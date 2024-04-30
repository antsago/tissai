import json
import psycopg2
import psycopg2.extras

psycopg2.extras.register_uuid()

URANUS_CONNECTION_STRING = "postgres://postgres:postgres@postgres:5432/uranus"
GAIA_CONNECTION_STRING = "postgres://postgres:postgres@postgres:5432/gaia"

def getPages():
  with psycopg2.connect(URANUS_CONNECTION_STRING) as conn:
    with conn.cursor() as curs:
      curs.execute("SELECT id, body FROM pages;")
      while (row := curs.fetchone()) is not None:
        yield {
          "id": row[0],
          "body": row[1],
        }

def createGaiaDb():
  with psycopg2.connect(GAIA_CONNECTION_STRING) as conn:
    with conn.cursor() as curs:
      curs.execute("""
        CREATE TABLE IF NOT EXISTS triples (
          id                     uuid PRIMARY KEY,
          page                   uuid NOT NULL,
          predicate              text NOT NULL,
          subject_value          text,
          subject_rfd_type       text,
          subject_is_string      boolean NOT NULL,
          object_value           text,
          object_rfd_type        text,
          object_is_string       boolean NOT NULL
        );
      """)

def addTriple(triple):
  toStore = {
    "id": triple.id,
    "page": triple.page,
    "predicate": triple.predicate,
    "subject_value": triple.subject if type(triple.subject) == str else json.dumps(triple.subject),
    "subject_rfd_type": triple.subjectType,
    "subject_is_string": type(triple.subject) == str,
    "object_value": triple.object if type(triple.object) == str else json.dumps(triple.object),
    "object_rfd_type": triple.objectType,
    "object_is_string": type(triple.object) == str,
  }
  with psycopg2.connect(GAIA_CONNECTION_STRING) as conn:
    with conn.cursor() as curs:
      curs.execute(
      """
        INSERT INTO triples (
          id,
          page,
          predicate,
          subject_value,
          subject_rfd_type,
          subject_is_string,
          object_value,
          object_is_string,
          object_rfd_type
        ) VALUES (
          %(id)s,
          %(page)s,
          %(predicate)s,
          %(subject_value)s,
          %(subject_rfd_type)s,
          %(subject_is_string)s,
          %(object_value)s,
          %(object_is_string)s,
          %(object_rfd_type)s
        );
      """,
      toStore)

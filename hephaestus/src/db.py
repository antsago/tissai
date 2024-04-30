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

def addPredicate(predicate):
  toStore = {
    "id": predicate.id,
    "page": predicate.page,
    "predicate": predicate.predicate,
    "subject_value": predicate.subject,
    "subject_rfd_type": predicate.subjectType,
    "subject_is_string": True,
    "object_value": predicate.object,
    "object_rfd_type": predicate.objectType,
    "object_is_string": True,
  }
  with psycopg2.connect("postgres://postgres:postgres@postgres:5432/gaia") as conn:
    with conn.cursor() as curs:
      curs.execute(
      """
        INSERT INTO predicates (
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

import importlib
import pytest
from unittest.mock import call
from asymmetric_matchers import string_matching
from __tests__ import MockPg
from triples import Triple
import db

def test_configures_psycopg():
  mocked = MockPg()

  importlib.reload(db)

  assert mocked.extras.register_uuid.call_count == 1

def test_getPages():
  mocked = MockPg()
  page1 = {
    "id": "page-id",
    "body": "the page body",
  }
  page2 = {
    "id": "page-id-2",
    "body": "the second page body",
  }
  mocked.cursor.fetchone.side_effect = [(page1["id"], page1["body"]), (page2["id"], page2["body"]), None]

  result = list(db.getPages())

  assert result == [page1, page2]

@pytest.mark.parametrize("input, expected", [
  ({}, {}),
  ({ "subjectType": "Value" }, { "subject_rfd_type": "Value" }),
  ({ "subjectType": "http://schema.org/Date" }, { "subject_rfd_type": "http://schema.org/Date" }),
  ({ "objectType": "Value" }, { "object_rfd_type": "Value" }),
  ({ "objectType": "http://schema.org/Date" }, { "object_rfd_type": "http://schema.org/Date" }),
  ({ "subject": True }, { "subject_value": "true", "subject_is_string": False }),
  ({ "subject": None }, { "subject_value": "null", "subject_is_string": False }),
  ({ "subject": 24.99 }, { "subject_value": "24.99", "subject_is_string": False }),
  ({ "object": True }, { "object_value": "true", "object_is_string": False }),
  ({ "object": None }, { "object_value": "null", "object_is_string": False }),
  ({ "object": 24.99 }, { "object_value": "24.99", "object_is_string": False }),
])
def test_adds_triples(input, expected):
  mocked = MockPg()
  triple = Triple(**{
    "id": "id",
    "page": "page-id",
    "subject": "Subject",
    "predicate": "Predicate",
    "object": "Object",
    "subjectType": "IRI",
    "objectType": "IRI",
    **input
  })

  db.addTriple(triple)

  assert [call(string_matching('INSERT INTO triples'), {
    "id": "id",
    "page": "page-id",
    "predicate": "Predicate",
    "subject_value": "Subject",
    "subject_rfd_type": "IRI",
    "subject_is_string": True,
    "object_value": "Object",
    "object_rfd_type": "IRI",
    "object_is_string": True,
    **expected,
  })] == mocked.cursor.execute.call_args_list

def test_dbCreation():
  mocked = MockPg()

  db.createGaiaDb()

  assert mocked.cursor.execute.call_args_list == [call(string_matching('CREATE TABLE .* triples'))]

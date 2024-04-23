import importlib
from unittest.mock import call
from asymmetric_matchers import string_matching
from __tests__ import MockPg, product
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

def test_saveProduct():
  mocked = MockPg()

  db.loadProduct(product)

  assert mocked.cursor.execute.call_args_list == [call(string_matching('INSERT INTO products'), product)]

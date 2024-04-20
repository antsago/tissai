import re
from mocks import MockPg
from fakes import product
import db

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

  assert mocked.cursor.execute.call_count == 1
  assert re.compile('INSERT INTO products').search(mocked.cursor.execute.call_args.args[0]) != None

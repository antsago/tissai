import re
from __tests__ import MockPg, productSchema, pageForTest

def test_turns_pages_into_products():
  mocked = MockPg()
  page1 = {
    "id": "page-id",
    **pageForTest([productSchema]),
  }
  page2 = {
    "id": "page-id-2",
    **pageForTest([productSchema]),
  }
  mocked.cursor.fetchone.side_effect = [(page1["id"], page1["body"]), (page2["id"], page2["body"]), None]

  import main

  assert mocked.cursor.execute.call_count == 4
  assert re.compile('INSERT INTO products').search(mocked.cursor.execute.call_args.args[0]) != None

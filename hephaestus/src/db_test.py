import re
from unittest.mock import MagicMock
import db
import psycopg2 

class FakePg(dict):
    def __init__(self):
      self.connect = MagicMock()
      connectionContext = MagicMock()
      self.connection = MagicMock()
      cursorContext = MagicMock()
      self.cursor = MagicMock()

      psycopg2.connect = self.connect
      self.connect.return_value = connectionContext
      connectionContext.__enter__.return_value = self.connection
      self.connection.cursor.return_value = cursorContext
      cursorContext.__enter__.return_value = self.cursor
    
    def __getattr__(self, key):
        return self[key]

    def __setattr__(self, key, value):
        self[key] = value

def test_getPages():
  fake = FakePg()
  page1 = {
    "id": "page-id",
    "body": "the page body",
  }
  page2 = {
    "id": "page-id-2",
    "body": "the second page body",
  }
  fake.cursor.fetchone.side_effect = [(page1["id"], page1["body"]), (page2["id"], page2["body"]), None]

  result = list(db.getPages())

  assert result == [page1, page2]

def test_saveProduct():
  product = {
    "id": "page-id",
    "title": "the product name",
    "description": "the product name",
    "images": "the product name",
  }
  fake = FakePg()

  db.loadProduct(product)

  assert fake.cursor.execute.called == 1
  assert re.compile('INSERT INTO products').search(fake.cursor.execute.call_args.args[0]) != None

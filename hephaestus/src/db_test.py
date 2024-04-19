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

def test_getPage():
  fake = FakePg()
  page = {
    "id": "page-id",
    "body": "the page body",
  }
  fake.cursor.fetchone.return_value = (page["id"], page["body"])

  result = db.getPage()
  assert result == page

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

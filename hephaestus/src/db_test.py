from unittest.mock import MagicMock
import db

class FakePg(dict):
    def __init__(self):
      self.connect = MagicMock()
      self.connection = MagicMock()
      self.cursor = MagicMock()
      self.connect.return_value = MagicMock()
      self.connect().__enter__.return_value = self.connection
      self.connection.cursor.return_value = MagicMock()
      self.connection.cursor().__enter__.return_value = self.cursor

      db.psycopg2.connect = self.connect
    
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

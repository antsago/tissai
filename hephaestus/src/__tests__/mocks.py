from unittest.mock import MagicMock
import psycopg2 

class MockPg(dict):
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

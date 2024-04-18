import main
from unittest.mock import MagicMock


def test_main():
  page = {
    "id": "page-id",
    "body": "the page body",
  }
  connect = MagicMock()
  connect.return_value = MagicMock()
  connect().__enter__.return_value = MagicMock()
  connect().__enter__().cursor.return_value = MagicMock()
  connect().__enter__().cursor().__enter__.return_value = MagicMock()
  connect().__enter__().cursor().__enter__().fetchone.return_value = (page["id"], page["body"])
  main.psycopg2.connect = connect

  result = main.main()
  assert result == page

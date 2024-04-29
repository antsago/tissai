# import pytest
# import importlib
# from unittest.mock import call
# from asymmetric_matchers import string_matching, list_containing, dict_containing
# from __tests__ import MockPg, productSchema, pageForTest

# def test_turns_pages_into_products():
#   mocked = MockPg()
#   page1 = {
#     **pageForTest([productSchema]),
#     "id": "page-id",
#   }
#   page2 = {
#     **pageForTest([productSchema]),
#     "id": "page-id-2",
#   }
#   mocked.cursor.fetchone.side_effect = [(page1["id"], page1["body"]), (page2["id"], page2["body"]), None]

#   import main

#   assert list_containing([
#     call(string_matching('INSERT INTO products'), dict_containing({ "page": page1["id"], })),
#     call(string_matching('INSERT INTO products'), dict_containing({ "page": page2["id"], }))
#   ]) == mocked.cursor.execute.call_args_list

# def test_prints_current_page_on_error(capsys):
#   mocked = MockPg()
#   page1 = {
#     **pageForTest([productSchema]),
#     "id": "page-id",
#   }
#   page2 = {
#     **pageForTest([productSchema]),
#     "id": "page-id-2",
#   }
#   mocked.cursor.fetchone.side_effect = [(page1["id"], page1["body"]), (page2["id"], page2["body"]), None]
#   mocked.cursor.execute.side_effect = [None, None, None, Exception("Booh!")]

#   with pytest.raises(Exception):
#     import main
#     importlib.reload(main)

#   assert capsys.readouterr().out == string_matching(page2["id"])

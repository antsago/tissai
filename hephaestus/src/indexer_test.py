from indexer import parse


def test_extracts_json_ld_products():
    result = parse()
    assert result == True

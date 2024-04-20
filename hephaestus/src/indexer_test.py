import indexer
from asymmetric_matchers import anything
from fakes import productSchema, orgSchema

expectedProduct = {
  "id": anything(),
  "title": productSchema["name"],
  "description": productSchema["description"],
  "images": [productSchema["image"]],
}

def test_converts_jsonld_to_product():
    result = indexer.toProduct([productSchema])

    assert result == [expectedProduct]

def test_ignores_non_product():
    result = indexer.toProduct([orgSchema, productSchema])

    assert result == [expectedProduct]

def test_handles_pages_with_multiple_products():
    result = indexer.toProduct([productSchema, productSchema])

    assert result == [expectedProduct, expectedProduct]

def test_handles_pages_without_product():
    result = indexer.toProduct([orgSchema])

    assert result == []

def test_handles_images_array():
    result = indexer.toProduct([{
        **productSchema,
        "image": [productSchema["image"]],
    }])

    assert result == [expectedProduct]

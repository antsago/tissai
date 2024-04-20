from asymmetric_matchers import anything
from unittest.mock import Mock
from __tests__ import productSchema, orgSchema
import indexer

expectedProduct = {
  "id": anything(),
  "title": productSchema["name"],
  "description": productSchema["description"],
  "images": [productSchema["image"]],
}

def test_converts_jsonld_to_product():
    page = Mock(jsonLd = [productSchema])

    result = indexer.toProduct(page)

    assert result == [expectedProduct]

def test_ignores_non_product():
    page = Mock(jsonLd = [orgSchema, productSchema])

    result = indexer.toProduct(page)

    assert result == [expectedProduct]

def test_handles_pages_with_multiple_products():
    page = Mock(jsonLd = [productSchema, productSchema])

    result = indexer.toProduct(page)

    assert result == [expectedProduct, expectedProduct]

def test_handles_pages_without_product():
    page = Mock(jsonLd = [orgSchema])

    result = indexer.toProduct(page)

    assert result == []

def test_handles_images_array():
    page = Mock(jsonLd = [{
        **productSchema,
        "image": [productSchema["image"]],
    }])

    result = indexer.toProduct(page)

    assert result == [expectedProduct]

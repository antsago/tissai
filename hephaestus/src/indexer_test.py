import json
import indexer
from asymmetric_matchers import anything

def test_extracts_json_ld_products():
    product = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "The name of the product",
    }
    page = f"""
        <html>
          <head>
            <script type=\"application/ld+json\">{json.dumps(product)}</script>
            <script src=\"_ascript\"></script>
          </head>
        </html>
    """
    result = indexer.parse(page)
    assert result == product

def test_ignores_empty_pages():
    page = f"""
        <html>
          <head>
            <script src=\"_ascript\"></script>
          </head>
        </html>
    """
    result = indexer.parse(page)
    assert result == None

def test_converts_jsonld_to_product():
    jsonLd = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "The name of the product",
      "description": "The description in ld",
      "image": "https//image.com/png",
    }
    result = indexer.toProduct(jsonLd)
    assert result == {
        "id": anything(),
        "title": jsonLd["name"],
        "description": jsonLd["description"],
        "images": [jsonLd["image"]],
    }

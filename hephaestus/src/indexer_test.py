import json
from indexer import parse


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
    result = parse(page)
    assert result == product

import json
import indexer

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

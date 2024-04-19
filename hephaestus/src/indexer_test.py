import json
import indexer
from asymmetric_matchers import anything

def test_extracts_json_ld():
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
    assert result == [product]

def test_extracts_multiple_json_ld():
    product = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "The name of the product",
    }
    org = {
      '@context': 'http://schema.org',
      '@type': 'Organization',
      'name': 'Algo Bonito',
      'logo': 'https://algo-bonito.com/cdn/shop/files/LogoFondoTrans_1024_1024x.png?v=1623856034',
      'sameAs': ['', '', '', '', '', '', '', ''],
      'url': 'https://algo-bonito.com'
    }
    page = f"""
        <html>
          <head>
            <script type=\"application/ld+json\">{json.dumps(product)}</script>
            <script type=\"application/ld+json\">{json.dumps(org)}</script>
          </head>
        </html>
    """
    result = indexer.parse(page)
    assert result == [
      product,
      org,
    ]

def test_ignores_empty_pages():
    page = f"""
        <html>
          <head>
            <script src=\"_ascript\"></script>
          </head>
        </html>
    """
    result = indexer.parse(page)
    assert result == []

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

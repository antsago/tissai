import json
import indexer
from asymmetric_matchers import anything

product = {
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "The name of the product",
  "description": "The description in ld",
  "image": "https//image.com/png",
}
org = {
  '@context': 'http://schema.org',
  '@type': 'Organization',
  'name': 'Algo Bonito',
  'logo': 'https://algo-bonito.com/LogoFondoTrans_1024_1024x.png',
  'url': 'https://algo-bonito.com'
}

def test_extracts_json_ld():
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
    page = f"""
        <html>
          <head>
            <script type=\"application/ld+json\">{json.dumps(product)}</script>
            <script type=\"application/ld+json\">{json.dumps(org)}</script>
          </head>
        </html>
    """

    result = indexer.parse(page)

    assert result == [product, org]

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
    result = indexer.toProduct([product])

    assert result == {
        "id": anything(),
        "title": product["name"],
        "description": product["description"],
        "images": [product["image"]],
    }

def test_ignores_non_product():
    result = indexer.toProduct([org, product])

    assert result == {
        "id": anything(),
        "title": product["name"],
        "description": product["description"],
        "images": [product["image"]],
    }

def test_handles_images_array():
    result = indexer.toProduct([{
        **product,
        "image": [product["image"]],
    }])

    assert result == {
        "id": anything(),
        "title": product["name"],
        "description": product["description"],
        "images": [product["image"]],
    }

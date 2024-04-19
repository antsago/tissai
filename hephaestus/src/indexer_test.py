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
expectedProduct = {
  "id": anything(),
  "title": product["name"],
  "description": product["description"],
  "images": [product["image"]],
}

def test_converts_jsonld_to_product():
    result = indexer.toProduct([product])

    assert result == [expectedProduct]

def test_ignores_non_product():
    result = indexer.toProduct([org, product])

    assert result == [expectedProduct]

def test_handles_pages_with_multiple_products():
    result = indexer.toProduct([product, product])

    assert result == [expectedProduct, expectedProduct]

def test_handles_pages_without_product():
    result = indexer.toProduct([org])

    assert result == []

def test_handles_images_array():
    result = indexer.toProduct([{
        **product,
        "image": [product["image"]],
    }])

    assert result == [expectedProduct]

from asymmetric_matchers import string_matching, list_containing
from __tests__ import productSchema, orgSchema, pageForTest
from hephaestus.src.predicates import Predicates

productPredicates = [
    (string_matching(".*"), 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Product'),
    (string_matching(".*"), 'http://schema.org/name', 'The name of the product'),
    (string_matching(".*"), 'http://schema.org/description', 'The description in ld'),
    (string_matching(".*"), 'http://schema.org/image', 'https://image.com/png'),
]
orgPredicates = [
    (string_matching(".*"), 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Product'),
    (string_matching(".*"), 'http://schema.org/name', 'The name of the product'),
    (string_matching(".*"), 'http://schema.org/description', 'The description in ld'),
    (string_matching(".*"), 'http://schema.org/image', 'https://image.com/png'),
]

def test_extracts_json_ld():
    rawPage = pageForTest([productSchema])
    page = Predicates(rawPage)
    assert list_containing(productPredicates) == list(page.jsonLd)

def test_extracts_multiple_json_ld():
    rawPage = pageForTest([productSchema, orgSchema])
    page = Predicates(rawPage)
    assert list_containing([*productPredicates, *orgPredicates]) == list(page.jsonLd)

def test_ignores_empty_pages():
    rawPage = pageForTest([])
    page = Predicates(rawPage)
    assert [] == list(page.jsonLd)

def test_stores_page_id():
    rawPage = pageForTest([])
    page = Predicates(rawPage)
    assert page.id == rawPage["id"]

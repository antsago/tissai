from asymmetric_matchers import string_matching, list_containing
from __tests__ import productSchema, orgSchema, pageForTest
from predicates import Predicates

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

def test_json_ld():
    rawPage = pageForTest([productSchema])
    predicates = Predicates(rawPage)
    assert list_containing(productPredicates) == list(predicates.jsonLd)

def test_multiple_json_ld():
    rawPage = pageForTest([productSchema, orgSchema])
    predicates = Predicates(rawPage)
    assert list_containing([*productPredicates, *orgPredicates]) == list(predicates.jsonLd)

def test_empty_pages():
    rawPage = pageForTest([])
    predicates = Predicates(rawPage)
    assert [] == list(predicates.jsonLd)

def test_non_string_json_ld():
    rawPage = pageForTest([{
        "@context":{ "@vocab": "http://schema.org/" },
        "@type":"Offer",
        "seller":{
            "@type":"Organization",
            "name":"DECATHLON"
        },
        "isFamilyFriendly": True,
        "itemCondition":"https://schema.org/NewCondition",
        "price":24.99,
        "validFrom": "2011-04-01"
    }])

    predicates = Predicates(rawPage)

    assert list_containing([
        (string_matching(".*"), "http://schema.org/isFamilyFriendly", "true"),
        (string_matching(".*"), "http://schema.org/itemCondition", "https://schema.org/NewCondition"),
        (string_matching(".*"), "http://schema.org/price", "24.99"),
        (string_matching(".*"), "http://schema.org/seller", string_matching(".*")),
        (string_matching(".*"), "http://schema.org/validFrom", "2011-04-01"),
        (string_matching(".*"), "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://schema.org/Offer"),
        (string_matching(".*"), "http://schema.org/name", "DECATHLON"),
        (string_matching(".*"), "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://schema.org/Organization"),
    ]) == list(predicates.jsonLd)

def test_stores_page_id():
    rawPage = pageForTest([])
    predicates = Predicates(rawPage)
    assert predicates.pageId == rawPage["id"]

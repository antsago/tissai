from asymmetric_matchers import string_matching, list_containing
from __tests__ import productSchema, orgSchema, pageForTest
from predicates import createPredicates, Predicate

productPredicates = [
    Predicate(string_matching(".*"), "IRI", 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Product', "IRI"),
    Predicate(string_matching(".*"), "IRI", 'http://schema.org/name', 'The name of the product', "Value"),
    Predicate(string_matching(".*"), "IRI", 'http://schema.org/description', 'The description in ld', "Value"),
    Predicate(string_matching(".*"), "IRI", 'http://schema.org/image', 'https://image.com/png', "Value"),
]
orgPredicates = [
    Predicate(string_matching(".*"), "IRI", 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Product', "IRI"),
    Predicate(string_matching(".*"), "IRI", 'http://schema.org/name', 'The name of the product', "Value"),
    Predicate(string_matching(".*"), "IRI", 'http://schema.org/description', 'The description in ld', "Value"),
    Predicate(string_matching(".*"), "IRI", 'http://schema.org/image', 'https://image.com/png', "Value"),
]

def test_json_ld():
    rawPage = pageForTest([productSchema])
    predicates = createPredicates(rawPage)
    assert list_containing(productPredicates) == list(predicates)

def test_multiple_json_ld():
    rawPage = pageForTest([productSchema, orgSchema])
    predicates = createPredicates(rawPage)
    assert list_containing([*productPredicates, *orgPredicates]) == list(predicates)

def test_empty_pages():
    rawPage = pageForTest([])
    predicates = createPredicates(rawPage)
    assert [] == list(predicates)

def test_non_string_json_ld():
    rawPage = pageForTest([{
        "@context":{
            "@vocab": "http://schema.org/",
            "validFrom": { "@type": "Date"},
        },
        "@type":"Offer",
        "seller":{
            "@type":"Organization",
            "name":"DECATHLON"
        },
        "isFamilyFriendly": False,
        "itemCondition":"https://schema.org/NewCondition",
        "price":24.99,
        "validFrom": "2011-04-01"
    }])

    predicates = createPredicates(rawPage)

    assert list_containing([
        Predicate(string_matching(".*"), "IRI", "http://schema.org/isFamilyFriendly", False, "http://www.w3.org/2001/XMLSchema#boolean"),
        Predicate(string_matching(".*"), "IRI", "http://schema.org/itemCondition", "https://schema.org/NewCondition", "Value"),
        Predicate(string_matching(".*"), "IRI", "http://schema.org/price", 24.99, "http://www.w3.org/2001/XMLSchema#double"),
        Predicate(string_matching(".*"), "IRI", "http://schema.org/seller", string_matching(".*"), "IRI"),
        Predicate(string_matching(".*"), "IRI", "http://schema.org/validFrom", "2011-04-01", "http://schema.org/Date"),
        Predicate(string_matching(".*"), "IRI", "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://schema.org/Offer", "IRI"),
        Predicate(string_matching(".*"), "IRI", "http://schema.org/name", "DECATHLON", "Value"),
        Predicate(string_matching(".*"), "IRI", "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://schema.org/Organization", "IRI"),
    ]) == list(predicates)

# def test_stores_page_id():
#     rawPage = pageForTest([])
#     predicates = Predicates(rawPage)
#     assert predicates.pageId == rawPage["id"]

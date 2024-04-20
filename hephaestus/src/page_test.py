from __tests__ import productSchema, orgSchema, pageForTest
from page import Page

def test_extracts_json_ld():
    rawPage = pageForTest([productSchema])

    page = Page(rawPage)

    assert page.jsonLd == [productSchema]

def test_extracts_multiple_json_ld():
    rawPage = pageForTest([productSchema, orgSchema])

    page = Page(rawPage)

    assert page.jsonLd == [productSchema, orgSchema]

def test_ignores_empty_pages():
    rawPage = pageForTest([])

    page = Page(rawPage)

    assert page.jsonLd == []

def test_stores_page_id():
    rawPage = pageForTest([])

    page = Page(rawPage)

    assert page.id == rawPage["id"]

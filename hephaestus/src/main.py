import db
from page import Page
import indexer

db.createGaiaDb()

for rawPage in db.getPages():
  page = Page(rawPage)
  product = indexer.toProduct(page.jsonLd)
  db.loadProduct(product)

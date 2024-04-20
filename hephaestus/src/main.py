import db
from page import Page
import indexer

db.createGaiaDb()

for rawPage in db.getPages():
  page = Page(rawPage)
  products = indexer.toProduct(page)
  for product in products:
    db.loadProduct(product)

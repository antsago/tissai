import db
from predicates import Predicates
import indexer

try:
  db.createGaiaDb()

  for rawPage in db.getPages():
    page = Predicates(rawPage)
    products = indexer.toProduct(page)
    for product in products:
      db.loadProduct(product)
except Exception as error:
  print(page.id)
  raise error

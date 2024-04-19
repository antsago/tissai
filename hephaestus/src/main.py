import db
import indexer

db.createGaiaDb()

for rawPage in db.getPages():
  page = indexer.parse(rawPage["body"])
  product = indexer.toProduct(page)
  db.loadProduct(product)

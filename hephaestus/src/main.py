import db
import indexer

db.createGaiaDb()

for page in db.getPages():
  data = indexer.parse(page["body"])
  product = indexer.toProduct(data)
  db.loadProduct(product)

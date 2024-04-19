import db
import indexer

pages = db.getPages()
data = indexer.parse(next(pages)["body"])
product = indexer.toProduct(data)
db.createGaiaDb()
db.loadProduct(product)
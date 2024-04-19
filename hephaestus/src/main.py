import db
import indexer

page = db.getPage()
data = indexer.parse(page["body"])
product = indexer.toProduct(data)
db.createGaiaDb()
db.loadProduct(product)
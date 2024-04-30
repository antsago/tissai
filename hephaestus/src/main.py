import db
from triples import createTriples

# try:
db.createGaiaDb()

for page in db.getPages():
  for triple in createTriples(page):
    db.addTriple(triple)
# except Exception as error:
#   print(page["id"])
#   raise error

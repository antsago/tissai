import json
import pathlib

currentDirectory = pathlib.Path(__file__).parent.resolve()
dbFile = open(f"{currentDirectory}/../../data/products.json")

products = json.load(dbFile)

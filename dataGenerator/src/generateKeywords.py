import json
from rake_nltk import Rake

dbFile = open('../data/products.json')

def get_keywords(product):
  r = Rake(language="spanish")
  r.extract_keywords_from_text(product['name'] + '. ' + product['description'])
  return r.get_ranked_phrases_with_scores()

products = json.load(dbFile)
products_with_keywords_strings = [{ 'keywords': get_keywords(product), 'name': product['name'], 'description': product['description'], 'id': product['id'] } for product in products]
print(json.dumps(products_with_keywords_strings, ensure_ascii=False))

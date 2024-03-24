import json
import math
from rake_nltk import Rake

# Must be done at least once in the environment
# nltk.download('stopwords')
# nltk.download('punkt')

dbFile = open('../data/products.json')

def get_keywords(product):
  r = Rake(language="spanish")
  r.extract_keywords_from_text(product['name'] + '. ' + product['description'])
  return [key for (score, key) in r.get_ranked_phrases_with_scores()]

products = json.load(dbFile)
# product_keywords = [{ 'keywords': get_keywords(product), 'name': product['name'], 'description': product['description'], 'id': product['id'] } for product in products]
product_keywords = [get_keywords(product) for product in products]

frequencies = {}
for key_list in product_keywords:
  cut = math.floor(len(key_list)/3)
  for index, key in enumerate(key_list):
    if (not key in frequencies):
      frequencies[key] = { 'rdf': 0, 'edf': 0 }
    frequencies[key]['rdf'] += 1
    if (index < cut):
      frequencies[key]['edf'] += 1

keywords = { key: {
  'rdf': c['rdf'],
  'edf': c['edf'],
  'exc': c['edf']/c['rdf'],
  'ess': c['edf']*c['edf']/c['rdf'],
  'gen': c['rdf']-c['edf']
} for (key, c) in frequencies.items() }

# by_ess = sorted(keywords.keys(), key=lambda x: keywords[x]['ess'], reverse=True)
# by_gen = sorted(keywords.keys(), key=lambda x: keywords[x]['gen'], reverse=True)

# print(json.dumps(product_keywords, ensure_ascii=False))

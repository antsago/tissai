import spacy
# from spacy import displacy
from products import products

nlp = spacy.load('es_core_news_sm')
# nlp = es_core_news_sm.load(exclude=['morphologizer', 'parser', 'attribute_ruler', 'lemmatizer', 'ner'])

def getTests(title):
  doc = nlp(title)
  # displacy.serve(doc, style="dep", port=5002)
  return [token.text for token in doc if not (token.is_stop or token.is_punct)]

if __name__ == "__main__":
  print(getTests(products[27]['name']))
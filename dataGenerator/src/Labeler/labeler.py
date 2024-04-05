import spacy

nlp = spacy.load('es_core_news_sm', exclude=['morphologizer', 'parser', 'attribute_ruler', 'lemmatizer', 'ner'])

def getLabels(title):
  doc = nlp(title.lower())
  return { token.text for token in doc if not (
    token.is_stop or token.is_punct or token.is_space or token.is_quote or token.is_bracket
  )}

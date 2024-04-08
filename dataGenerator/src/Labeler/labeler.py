import spacy

nlp = spacy.load('es_core_news_sm', exclude=['morphologizer', 'parser', 'attribute_ruler', 'lemmatizer', 'ner'])

def getLabels(title):
  isMeaningless = lambda token: not (
    token.is_stop
    or token.is_punct
    or token.is_space or token.is_quote or token.is_bracket
    or token.is_digit
    or token.is_currency
    or token.text == '|'
  )
  doc = nlp(title)
  return { token.lower_ for token in doc if isMeaningless(token) }

def getCategory(title):
  doc = nlp(title)
  return doc[0].lower_

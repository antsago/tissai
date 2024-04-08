import spacy

nlp = spacy.load('es_core_news_sm', exclude=['morphologizer', 'parser', 'attribute_ruler', 'lemmatizer', 'ner'])

class Labeler:
  def __init__(self, title):
    self.title = title
    self.doc = nlp(self.title)

  def getLabels(self):
    isMeaningless = lambda token: not (
      token.is_stop
      or token.is_punct
      or token.is_space or token.is_quote or token.is_bracket
      or token.is_digit
      or token.is_currency
      or token.text == '|'
    )
    return { token.lower_ for token in self.doc if isMeaningless(token) }

  def getCategory(self):
    return self.doc[0].lower_

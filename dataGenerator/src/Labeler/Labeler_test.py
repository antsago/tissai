from .labeler import getTests

def test_words_are_tokenized():
  title = "vaqueros ajustados"
  result = getTests(title)
  assert result == ['vaqueros', 'ajustados']

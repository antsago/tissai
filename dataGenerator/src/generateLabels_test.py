from generateLabels import getTests

def tests_foo():
  title = "vaqueros ajustados"
  result = getTests(title)
  assert result == ['vaqueros', 'ajustados']

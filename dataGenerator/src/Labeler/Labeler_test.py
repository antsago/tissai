import pytest
from .labeler import getLabels

@pytest.mark.parametrize(
  "title,expected",
  [
    # Separates words
    ("vaqueros ajustados", {'ajustados', 'vaqueros'}),
    # Igores repeated words
    ("vaqueros vaqueros", {'vaqueros'}),
    # Ignores capitalization
    ("Vaqueros ajustados", {'ajustados', 'vaqueros'}),
    # Supports multiple sentences
    ("vaqueros ajustados. talla alta", {'alta', 'ajustados', 'alta', 'vaqueros', 'talla'}),
    # Ignores symbols
    ("vaqueros , & ' ( ) [] |", {'vaqueros'}),
    # Ignores stopwords
    ("vaqueros en aquí", {'vaqueros'}),
    # Ignores numbers
    ("vaqueros 1986 5 bolsillos", {'vaqueros', 'bolsillos'}),
    # Ignores currency
    ("vaqueros $230 por 2€", {'vaqueros'}),
  ],
)

def test_get_labels(title, expected):
  result = getLabels(title)
  assert result == expected

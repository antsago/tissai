import string
from functools import reduce


def getFirstWord(generatedText):
    firstSentence = generatedText.split("\n")[0]
    words = [w for w in firstSentence.split(" ") if w and not w.isspace()]
    firstWord = words[0] if len(words) > 0 else ""
    return reduce(
        lambda word, punctuation: word.replace(punctuation, ""),
        string.punctuation,
        firstWord,
    )

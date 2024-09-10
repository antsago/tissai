import string
from functools import reduce


def getFirstWord(generatedText):
    firstSentence = generatedText.split("\n")[0]
    firstWord = [w for w in firstSentence.split(" ") if w and not w.isspace()][0]
    return reduce(
        lambda word, punctuation: word.replace(punctuation, ""),
        string.punctuation,
        firstWord,
    )

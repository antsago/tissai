const PUNCTUATION = /['!"#$%&\\'()\*+,\-\.\/:;<=>?@\[\\\]\^_`{|}~']/g

export const getFirstWord = (text: string) => text.split("\n").at(0)?.split(" ").map(s => s.replace(PUNCTUATION,"").trim()).filter(s => !!s).at(0)
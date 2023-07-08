
class PhraseCount {
  constructor (length, counts) {
    this.phrases = length;

    this.phrasesPerLanguage = counts;
  }

  toJSON () {
    return {
      phrases: this.phrases,
      phrasesPerLanguage: JSON.stringify(this.counts)
    };
  }
}

export default PhraseCount;

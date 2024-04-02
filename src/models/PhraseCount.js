
class PhraseCount {
  constructor (length, counts) {
    this.phrases = length;
    this.counts = counts;

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


class PhraseRoute {
  constructor (data) {
    this.name = data?.name;
    this.language = data?.language;
  }

  toJSON () {
    return {
      name: this.name,
      language: this.language
    };
  }
}

export default PhraseRoute;

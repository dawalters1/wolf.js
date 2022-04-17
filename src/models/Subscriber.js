const Base = require('./Base');

class Subscriber extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);

    this.id = data.id ?? 0;
    this.nickname = data.nickname ?? `<${this.id}>`;

    if (data.exists) {
      this.language = this.extended.language ? api.utility.toLanguageKey(this.extended.language) : api.config.get('app.defaultLanguage');
    }
  }

  // TODO:
}

module.exports = Subscriber;

const Base = require('./Base');

class Search extends Base {
  constructor (client, data) {
    super(client);

    this.searchType = data.searchType;
    this.id = data.id;
    this.hash = data.hash;
    this.reason = data.reason;
  }
}

module.exports = Search;

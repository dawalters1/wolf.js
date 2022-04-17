const Base = require('./Base');

class Cognito extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }

  async refresh () {
    return await this.api.getCognitoToken(true);
  }
}

module.exports = Cognito;


class WOLFAPIError extends Error {
  // eslint-disable-next-line no-useless-constructor
  constructor (error, param = undefined) {
    super(error);

    if (param) {
      this.params = param;
    }
  }
}

module.exports = WOLFAPIError;

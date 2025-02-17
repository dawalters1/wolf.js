
class WOLFError extends Error {
  constructor (message, params = undefined) {
    super(message);

    this.params = params;
  }
}

export default WOLFError;

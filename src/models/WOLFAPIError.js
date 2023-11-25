class WOLFAPIError extends Error {
  constructor (error, param = undefined) {
    super(error);

    this.params = param !== undefined ? this.params : undefined;
  }
}

export default WOLFAPIError;

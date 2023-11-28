class WOLFAPIError extends Error {
  constructor (error, param = undefined) {
    super(error);

    this.params = param !== undefined ? param : undefined;
  }
}

export default WOLFAPIError;

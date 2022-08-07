class WOLFAPIError extends Error {
  constructor (error, param = undefined) {
    super(error);
    if (param) {
      this.params = param;
    }
  }
}
export default WOLFAPIError;

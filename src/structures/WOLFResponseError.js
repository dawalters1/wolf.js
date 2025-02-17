
class WOLFResponseError extends Error {
  constructor (response) {
    super();

    this.code = response.code;
    this.subCode = response?.headers?.subCode ?? undefined;

    this.message =
      this.subCode
        ? `Request failed with code ${this.code} subCode ${this.subCode}`
        : `Request failed with code ${this.code}`;
  }
}

export default WOLFResponseError;

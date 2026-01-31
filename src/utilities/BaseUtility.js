
export default class BaseUtility {
  #client;

  constructor (client) {
    this.#client = client;
  }

  get client () {
    return this.#client;
  }

  normaliseArray (array) {
    return Array.isArray(array)
      ? array
      : [array];
  }

  normaliseNumber (num) {
    return Number(num) || num;
  }

  normaliseNumbers (ids) {
    return (Array.isArray(ids)
      ? ids
      : [ids]).map(
      (id) => this.normaliseNumber(id)
    );
  }
}

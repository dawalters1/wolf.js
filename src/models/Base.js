const EXCLUDE = ['client'];

const toJSON = (object) => {
  if (object && Array.isArray(object)) {
    return object.reduce((result, value) => {
      result.push(toJSON(value));

      return result;
    }, []);
  }

  return object && typeof object.toJSON === 'function' ? object.toJSON() : object;
};

class Base {
  /**
   *
   * @param {import('../client/WOLF.js').default} client
   */
  constructor (client) {
    this.client = client;
  }

  toJSON (stringify = false, replacer = null, space = null) {
    const json = Object.keys(this)
      .filter((propertyName) => !EXCLUDE.includes(propertyName) && !propertyName.startsWith('_'))
      .reduce((result, propertyName) => {
        result[propertyName] = toJSON(this[propertyName]);

        return result;
      }, {});

    return stringify ? JSON.stringify(json, replacer, space) : json;
  }
}

export default Base;

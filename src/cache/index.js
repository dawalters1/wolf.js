
const patch = (oldData, newData) => {
  for (const key in newData) {
    oldData[key] = newData[key];
  }
};

/**
 * Caching module
 * If key is not null array holds objects
 * If key is null array holds number, string, boolean, etc
 */
class Cache {
  constructor (opts) {

    // TODO: REWRITE
  }
}

module.exports = Cache;
